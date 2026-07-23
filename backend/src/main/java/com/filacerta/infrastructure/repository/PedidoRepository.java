package com.filacerta.infrastructure.repository;

import java.time.LocalDateTime;
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

	// Usando BETWEEN para evitar problemas com DATE()
	@Query("SELECT MAX(p.numero) FROM Pedido p WHERE p.dataHoraPedido BETWEEN :start AND :end")
	Integer findMaxNumeroByData(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

	List<Pedido> findByStatusOrderByDataHoraPedidoAsc(StatusPedido status);

	@Query("SELECT p FROM Pedido p WHERE p.status = :status ORDER BY p.dataHoraPedido ASC")
	List<Pedido> findFilaCozinha(@Param("status") StatusPedido status);

	Optional<Pedido> findByNumeroAndCaixaDiarioData(Integer numero, LocalDateTime caixaDiarioData);

	@Query("SELECT p FROM Pedido p WHERE p.numero = :numero AND p.caixaDiarioData BETWEEN :start AND :end")
	Optional<Pedido> findByNumeroAndData(@Param("numero") Integer numero, @Param("start") LocalDateTime start,
			@Param("end") LocalDateTime end);
}