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
    // Adicionamos o HttpServletResponse aqui
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
                
                // 1. Gera o token curto (15 min) para uso nas rotas
                String accessToken = tokenService.gerarToken(usuario.getUsername());
                
                // 2. Gera o token longo (7 dias) para renovação
                String refreshToken = tokenService.gerarRefreshToken(usuario.getUsername());
                
                // 3. Embala o Refresh Token num Cookie de segurança máxima (HttpOnly)
                Cookie refreshCookie = new Cookie("refreshToken", refreshToken);
                refreshCookie.setHttpOnly(true); // Impede leitura por JavaScript (XSS)
                refreshCookie.setSecure(false); // ATENÇÃO: Deixe false no localhost. Quando for para o Railway (HTTPS), mude para true!
                refreshCookie.setPath("/api/auth/refresh"); // O navegador só vai enviar esse cookie nessa rota específica
                refreshCookie.setMaxAge(7 * 24 * 60 * 60); // 7 dias em segundos
                
                response.addCookie(refreshCookie);
                
                return ResponseEntity.ok(accessToken);
            }
        }
        
        return ResponseEntity.status(401).body("Usuário ou senha inválidos");
    }

    // NOVA ROTA: Escuta o pedido de renovação lendo o cookie automaticamente
    @PostMapping("/refresh")
    public ResponseEntity<String> refresh(@CookieValue(name = "refreshToken", required = false) String refreshToken) {
        
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(401).body("Refresh Token não fornecido");
        }
        
        // Verifica se o token longo ainda é válido e se não foi adulterado
        String username = tokenService.validarToken(refreshToken);
        
        if (username.isEmpty()) {
            return ResponseEntity.status(401).body("Refresh Token inválido ou expirado. Faça login novamente.");
        }
        
        // Se estiver tudo certo, devolve um novo token de 15 minutos!
        String novoAccessToken = tokenService.gerarToken(username);
        return ResponseEntity.ok(novoAccessToken);
    }
}