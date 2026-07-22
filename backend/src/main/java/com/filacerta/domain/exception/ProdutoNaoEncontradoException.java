package com.filacerta.domain.exception;


public class ProdutoNaoEncontradoException extends NegocioException {

    public ProdutoNaoEncontradoException(Long produtoId) {
        super("Produto não encontrado com ID: " + produtoId);
    }
}
