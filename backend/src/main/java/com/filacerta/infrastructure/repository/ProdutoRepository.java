package com.filacerta.infrastructure.repository;

import com.filacerta.domain.entity.Produto;
import com.filacerta.domain.enums.CategoriaProduto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    List<Produto> findByDisponivelTrueOrderByCategoriaAscNomeAsc();

    List<Produto> findByCategoriaAndDisponivelTrueOrderByNomeAsc(CategoriaProduto categoria);

    boolean existsByNomeIgnoreCase(String nome);
}