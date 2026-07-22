package com.filacerta.domain.exception;

public class PedidoNaoEncontradoException extends NegocioException {

    public PedidoNaoEncontradoException(Long pedidoId) {
        super("Pedido não encontrado com ID: " + pedidoId);
    }

    public PedidoNaoEncontradoException(Integer numero) {
        super("Pedido não encontrado com número: #" + numero);
    }
}