package com.filacerta.config.security;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.filacerta.application.dto.request.LoginRequest;
import com.filacerta.domain.entity.Usuario;
import com.filacerta.infrastructure.repository.UsuarioRepository;

import io.github.bucket4j.Bucket;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final TokenService tokenService;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder; 
    private final LoginRateLimiter rateLimiter;

    public AuthController(TokenService tokenService, UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, LoginRateLimiter rateLimiter) { 
        this.tokenService = tokenService; 
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.rateLimiter = rateLimiter;
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest login, HttpServletResponse response) {
        
        Bucket bucket = rateLimiter.resolveBucket(login.username());
        if (!bucket.tryConsume(1)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Muitas tentativas de login. Por segurança, aguarde alguns minutos.");
        }
        
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(login.username());
        
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            
            if (passwordEncoder.matches(login.password(), usuario.getPassword())) {
                
                // MÁGICA: A senha está certa! Incrementa a versão, invalidando automaticamente todos os outros logins.
                Integer novaVersao = usuario.getVersaoToken() == null ? 1 : usuario.getVersaoToken() + 1;
                usuario.setVersaoToken(novaVersao);
                usuarioRepository.save(usuario);
                
                // 1. Gera o token passando a nova versão
                String accessToken = tokenService.gerarToken(usuario.getUsername(), novaVersao);
                
                // 2. Gera o token longo
                String refreshToken = tokenService.gerarRefreshToken(usuario.getUsername(), novaVersao);
                
                // 3. Embala o Refresh Token no Cookie Seguríssimo
                Cookie refreshCookie = new Cookie("refreshToken", refreshToken);
                refreshCookie.setHttpOnly(true); 
                refreshCookie.setSecure(true); // EM PRODUÇÃO PODE FICAR TRUE, pois estamos usando HTTPS no Nginx
                refreshCookie.setPath("/api/auth/refresh"); 
                refreshCookie.setMaxAge(7 * 24 * 60 * 60);
                
                response.addCookie(refreshCookie);
                
                return ResponseEntity.ok(accessToken);
            }
        }
        
        return ResponseEntity.status(401).body("Usuário ou senha inválidos");
    }

    @PostMapping("/refresh")
    public ResponseEntity<String> refresh(@CookieValue(name = "refreshToken", required = false) String refreshToken) {
        
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(401).body("Refresh Token não fornecido");
        }
        
        String username = tokenService.validarToken(refreshToken);
        
        if (username.isEmpty()) {
            return ResponseEntity.status(401).body("Refresh Token inválido ou expirado.");
        }
        
     // Pega o utilizador do banco
        Usuario usuario = usuarioRepository.findByUsername(username).orElse(null);
        Integer versaoNoCookie = tokenService.getVersaoToken(refreshToken);

        // Se a versão do cookie não bater com a versão atual do banco, BLOQUEIA a renovação
        if (usuario == null || versaoNoCookie == null || !versaoNoCookie.equals(usuario.getVersaoToken())) {
            return ResponseEntity.status(401).body("Sessão encerrada por outro dispositivo.");
        }
        
        // No momento da renovação, geramos um token fresquinho
        String novoAccessToken = tokenService.gerarToken(username, usuario.getVersaoToken());
        
        return ResponseEntity.ok(novoAccessToken);
    }
}