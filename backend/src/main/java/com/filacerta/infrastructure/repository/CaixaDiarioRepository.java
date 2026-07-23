package com.filacerta.infrastructure.repository;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.filacerta.domain.entity.CaixaDiario;
import com.filacerta.domain.enums.StatusCaixa;

@Repository
public interface CaixaDiarioRepository extends JpaRepository<CaixaDiario, Long> {

	Optional<CaixaDiario> findByDataAndStatus(LocalDate data, StatusCaixa status);

	Optional<CaixaDiario> findByStatus(StatusCaixa status);

	boolean existsByDataAndStatus(LocalDate data, StatusCaixa status);
}