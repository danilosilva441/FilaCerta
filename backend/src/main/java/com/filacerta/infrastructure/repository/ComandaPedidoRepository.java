package com.filacerta.infrastructure.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.filacerta.domain.entity.ComandaPedido;

@Repository
public interface ComandaPedidoRepository extends JpaRepository<ComandaPedido, Long> {

	List<ComandaPedido> findByComandaIdOrderByCreatedAtAsc(Long comandaId);
}