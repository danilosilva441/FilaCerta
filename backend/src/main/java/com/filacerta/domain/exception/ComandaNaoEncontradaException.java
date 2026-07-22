package com.filacerta.domain.exception;

public class ComandaNaoEncontradaException extends RuntimeException {
    
    public ComandaNaoEncontradaException(Long id) {
        super("Comanda não encontrada com ID: " + id);
    }
    
    public ComandaNaoEncontradaException(String codigo) {
        super("Comanda não encontrada com código: " + codigo);
    }
}
