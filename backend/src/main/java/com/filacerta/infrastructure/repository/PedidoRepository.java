package com.filacerta.infrastructure.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.filacerta.domain.entity.Pedido;
import com.filacerta.domain.enums.StatusPedido;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

	List<Pedido> findByStatus(StatusPedido status);

	List<Pedido> findByStatusIn(List<StatusPedido> statuses);

	@Query("SELECT MAX(p.numero) FROM Pedido p WHERE DATE(p.dataHoraPedido) = :data")
	Integer findMaxNumeroByData(@Param("data") LocalDate data);

	List<Pedido> findByStatusOrderByDataHoraPedidoAsc(StatusPedido status);

	@Query("SELECT p FROM Pedido p WHERE p.status = :status ORDER BY p.dataHoraPedido ASC")
	List<Pedido> findFilaCozinha(@Param("status") StatusPedido status);

	// CORRIGIDO: Usando caixaDiarioData em vez de caixaDiario
	Optional<Pedido> findByNumeroAndCaixaDiarioData(Integer numero, LocalDate caixaDiarioData);

	// Método para buscar por número e data
	@Query("SELECT p FROM Pedido p WHERE p.numero = :numero AND DATE(p.caixaDiarioData) = :data")
	Optional<Pedido> findByNumeroAndData(@Param("numero") Integer numero, @Param("data") LocalDate data);
}