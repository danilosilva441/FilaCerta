package com.filacerta.infrastructure.repository;

import com.filacerta.domain.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    
    // Busca o último número de pedido do dia para gerarmos o próximo (+1)
    @Query("SELECT MAX(p.numero) FROM Pedido p WHERE p.dataHoraPedido >= :inicioDoDia AND p.dataHoraPedido < :fimDoDia")
    Optional<Integer> findMaxNumeroByData(@Param("inicioDoDia") LocalDateTime inicioDoDia, @Param("fimDoDia") LocalDateTime fimDoDia);
}