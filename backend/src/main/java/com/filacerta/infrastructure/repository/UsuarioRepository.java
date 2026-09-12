package com.filacerta.infrastructure.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.filacerta.domain.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // O Spring Boot cria a query SQL sozinho só pelo nome do método!
    Optional<Usuario> findByUsername(String username);
}