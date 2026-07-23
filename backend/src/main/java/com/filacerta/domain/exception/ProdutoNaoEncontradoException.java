package com.filacerta.domain.exception;

public class ProdutoNaoEncontradoException extends RuntimeException {

    public ProdutoNaoEncontradoException(Long id) {
        super("Produto não encontrado com ID: " + id);
    }

    public ProdutoNaoEncontradoException(String mensagem) {
        super(mensagem);
    }
}