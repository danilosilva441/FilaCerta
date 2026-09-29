package com.filacerta.infrastructure.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.filacerta.domain.entity.ItemPedido;


public interface ItemPedidoRepository extends JpaRepository<ItemPedido, Long> {
}