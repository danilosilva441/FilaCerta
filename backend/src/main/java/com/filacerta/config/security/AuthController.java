package com.filacerta.config.security; // ou o pacote onde você colocou

import java.util.Optional;

import org.springframework.http.ResponseEntity;
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

    // Injetamos o Repositório no construtor
    public AuthController(TokenService tokenService, UsuarioRepository usuarioRepository) { 
        this.tokenService = tokenService; 
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest login) {
        
        // 1. Busca o usuário no banco de dados
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(login.username());
        
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            
            // 2. Compara a senha que veio do Angular com a que está salva no banco
            if (usuario.getPassword().equals(login.password())) {
                
                // 3. Se a senha bater, gera o crachá (Token)
                String token = tokenService.gerarToken(usuario.getUsername());
                return ResponseEntity.ok(token);
            }
        }
        
        // Se não achou o usuário ou a senha estiver errada
        return ResponseEntity.status(401).body("Usuário ou senha inválidos");
    }
}

record LoginRequest(String username, String password) {}