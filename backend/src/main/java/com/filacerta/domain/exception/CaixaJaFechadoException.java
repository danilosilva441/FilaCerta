package com.filacerta.domain.exception;

public class CaixaJaFechadoException extends NegocioException {

    public CaixaJaFechadoException() {
        super("Não há caixa aberto no momento. Abra o caixa antes de receber pedidos.");
    }
}