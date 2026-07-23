package com.filacerta.infrastructure.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.filacerta.domain.entity.SessaoCliente;

@Repository
public interface SessaoClienteRepository extends JpaRepository<SessaoCliente, Long> {
	Optional<SessaoCliente> findByTokenAndAtivoTrue(String token);

	List<SessaoCliente> findByAtivoTrue();

	Optional<SessaoCliente> findByClienteIdAndAtivoTrue(Long clienteId);
}