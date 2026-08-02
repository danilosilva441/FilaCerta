package com.filacerta.infrastructure.repository;

import java.time.LocalDate;
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

    // 🔧 CORRIGIDO: Usando BETWEEN para compatibilidade com H2
    @Query("SELECT MAX(p.numero) FROM Pedido p WHERE p.dataHoraPedido BETWEEN :inicio AND :fim")
    Integer findMaxNumeroByData(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    List<Pedido> findByStatusOrderByDataHoraPedidoAsc(StatusPedido status);

    @Query("SELECT p FROM Pedido p WHERE p.status = :status ORDER BY p.dataHoraPedido ASC")
    List<Pedido> findFilaCozinha(@Param("status") StatusPedido status);

    Optional<Pedido> findByNumeroAndCaixaDiarioData(Integer numero, LocalDate caixaDiarioData);

    // 🔧 CORRIGIDO: Usando BETWEEN para compatibilidade com H2
    @Query("SELECT p FROM Pedido p WHERE p.numero = :numero AND p.caixaDiarioData BETWEEN :inicio AND :fim")
    Optional<Pedido> findByNumeroAndData(
            @Param("numero") Integer numero,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim);
}