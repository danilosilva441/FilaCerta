package com.filacerta.domain.exception;

public class ItemNaoEncontradoException extends NegocioException {

    public ItemNaoEncontradoException(Long itemId) {
        super("Item não encontrado com ID: " + itemId);
    }

    public ItemNaoEncontradoException(String mensagem) {
        super(mensagem);
    }
}