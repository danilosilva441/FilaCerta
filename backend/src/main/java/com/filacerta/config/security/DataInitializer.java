package com.filacerta.config.security;



import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.filacerta.domain.entity.Usuario;
import com.filacerta.domain.enums.Role;
import com.filacerta.infrastructure.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        
        // Garante que o usuário do Suporte (Você) sempre exista
        if (usuarioRepository.findByUsername("suporte.filacerta").isEmpty()) {
            log.info("Criando usuário de administração do sistema (DS SysTech)...");
            
            Usuario admin = new Usuario();
            admin.setUsername("suporte.filacerta");
            admin.setPassword(passwordEncoder.encode("191527"));
            admin.setRole(Role.ADMIN); 
            admin.setVersaoToken(0);
            
            usuarioRepository.save(admin);
        }
    }
}