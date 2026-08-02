package com.filacerta.infrastructure.repository;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.filacerta.domain.entity.CaixaDiario;
import com.filacerta.domain.enums.StatusCaixa;

@Repository
public interface CaixaDiarioRepository extends JpaRepository<CaixaDiario, Long> {

    // Buscar por data e status
    Optional<CaixaDiario> findByDataAndStatus(LocalDate data, StatusCaixa status);

    // Buscar por data (qualquer status)
    Optional<CaixaDiario> findByData(LocalDate data);

    // Buscar por status (apenas um caixa ABERTO por vez)
    Optional<CaixaDiario> findByStatus(StatusCaixa status);

    // Verificar se existe por data e status
    boolean existsByDataAndStatus(LocalDate data, StatusCaixa status);

    // Verificar se existe por data (qualquer status)
    boolean existsByData(LocalDate data);
}