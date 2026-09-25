package com.filacerta.config.security;

import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.filacerta.domain.entity.Usuario;
import com.filacerta.infrastructure.repository.UsuarioRepository;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final TokenService tokenService;
    private final UsuarioRepository usuarioRepository;
    // 1. Declarar o PasswordEncoder
    private final PasswordEncoder passwordEncoder; 

    // 2. Injetar no construtor
    public AuthController(TokenService tokenService, UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) { 
        this.tokenService = tokenService; 
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest login) {
        
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(login.username());
        
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            
            // 3. A MÁGICA AQUI: Usar o matches() em vez de equals()
            // O primeiro parâmetro é a senha limpa (rochedo123), o segundo é o hash do banco
            if (passwordEncoder.matches(login.password(), usuario.getPassword())) {
                
                String token = tokenService.gerarToken(usuario.getUsername());
                return ResponseEntity.ok(token);
            }
        }
        
        return ResponseEntity.status(401).body("Usuário ou senha inválidos");
    }
}

record LoginRequest(String username, String password) {}