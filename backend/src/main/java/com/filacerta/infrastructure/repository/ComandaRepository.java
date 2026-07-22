package com.filacerta.infrastructure.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.filacerta.domain.entity.Comanda;
import com.filacerta.domain.enums.StatusComanda;

@Repository
public interface ComandaRepository extends JpaRepository<Comanda, Long> {

	List<Comanda> findByStatusOrderByAberturaAsc(StatusComanda status);

	Optional<Comanda> findByCodigoAndStatus(String codigo, StatusComanda status);

	boolean existsByCodigo(String codigo);
}