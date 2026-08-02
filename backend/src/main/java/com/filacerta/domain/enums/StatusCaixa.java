package com.filacerta.domain.enums;

public enum StatusCaixa {
    ABERTO,      // Caixa aberto e atendendo (recebe pedidos)
    PAUSADO,     // Caixa aberto mas PAUSADO (não recebe pedidos)
    FECHADO      // Caixa fechado (fim do dia)
}