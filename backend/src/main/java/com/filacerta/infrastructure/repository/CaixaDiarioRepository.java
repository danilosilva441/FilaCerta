package com.filacerta.infrastructure.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.filacerta.domain.entity.CaixaDiario;
import com.filacerta.domain.enums.StatusCaixa;


public interface CaixaDiarioRepository extends JpaRepository<CaixaDiario, Long> {
    Optional<CaixaDiario> findByStatus(StatusCaixa status);
}