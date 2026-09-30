package com.filacerta.infrastructure.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.filacerta.domain.entity.Pedido;


public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    
    // Busca o último número de pedido do dia para gerarmos o próximo (+1)
    @Query("SELECT MAX(p.numero) FROM Pedido p WHERE p.dataHoraPedido >= :inicioDoDia AND p.dataHoraPedido < :fimDoDia")
    Optional<Integer> findMaxNumeroByData(@Param("inicioDoDia") LocalDateTime inicioDoDia, @Param("fimDoDia") LocalDateTime fimDoDia);
    
    List<Pedido> findByCaixaDiarioId(Long caixaId);
    
    Optional<Pedido> findByCodigoAcompanhamento(String codigoAcompanhamento);
    
    
}