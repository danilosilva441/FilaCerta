package com.filacerta.domain.exception;

public class CaixaFechadoException extends NegocioException {
    
    public CaixaFechadoException() {
        super("Desculpe, estamos fechados no momento. Volte durante o horário de funcionamento!");
    }
    
    public CaixaFechadoException(String mensagem) {
        super(mensagem);
    }

    // Mensagens simplificadas para um único operador
    public static CaixaFechadoException pausaAlmoco() {
        return new CaixaFechadoException(
            "⏸️ Pausa para almoço. Voltamos em 30 minutos!"
        );
    }

    public static CaixaFechadoException pausaManutencao() {
        return new CaixaFechadoException(
            "⏸️ Pequena pausa para manutenção. Voltamos em 10 minutos!"
        );
    }

    public static CaixaFechadoException pausaPreparacao() {
        return new CaixaFechadoException(
            "⏸️ Preparando a cozinha. Voltamos em 5 minutos!"
        );
    }

    public static CaixaFechadoException pausaGenerica(String tempo) {
        return new CaixaFechadoException(
            "⏸️ Pausa rápida. Voltamos em " + tempo + "!"
        );
    }
}