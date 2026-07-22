package com.filacerta.infrastructure.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.filacerta.domain.entity.ItemPedido;
import com.filacerta.domain.enums.StatusItemPedido;

@Repository
public interface ItemPedidoRepository extends JpaRepository<ItemPedido, Long> {

	List<ItemPedido> findByPedidoIdAndStatus(Long pedidoId, StatusItemPedido status);

	long countByPedidoIdAndStatusNot(Long pedidoId, StatusItemPedido status);
}