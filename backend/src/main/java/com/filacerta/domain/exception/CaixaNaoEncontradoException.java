package com.filacerta.domain.exception;

import java.time.LocalDate;

public class CaixaNaoEncontradoException extends RuntimeException {
    
    public CaixaNaoEncontradoException(LocalDate data) {
        super("Caixa não encontrado para a data: " + data);
    }
}