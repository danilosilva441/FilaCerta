package com.filacerta.infrastructure.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.filacerta.domain.entity.Categoria;


public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
}