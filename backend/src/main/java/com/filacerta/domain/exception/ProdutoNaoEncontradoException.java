package com.filacerta.domain.exception;

public class ProdutoNaoEncontradoException extends RuntimeException {
	
	private static final long serialVersionUID = 1L;
	
    public ProdutoNaoEncontradoException(Long id) {
        super("Produto não encontrado com o ID: " + id);
    }
}