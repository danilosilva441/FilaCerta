CREATE TABLE caixa_diario (
    id BIGSERIAL PRIMARY KEY,
    data DATE NOT NULL UNIQUE,
    hora_abertura TIMESTAMP NOT NULL,
    hora_fechamento TIMESTAMP,
    valor_inicial DECIMAL(10, 2),
    status VARCHAR(20) NOT NULL,
    total_dinheiro DECIMAL(10, 2) DEFAULT 0,
    total_pedidos INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE pedidos (
    id BIGSERIAL PRIMARY KEY,
    numero INTEGER NOT NULL,
    nome_cliente VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    origem VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    status_pagamento VARCHAR(20),
    metodo_pagamento VARCHAR(20),
    valor_total DECIMAL(10, 2) DEFAULT 0,
    data_hora_pedido TIMESTAMP NOT NULL,
    data_hora_pronto TIMESTAMP,
    observacao VARCHAR(300),
    caixa_diario_id BIGINT REFERENCES caixa_diario(id)
);

CREATE TABLE itens_pedido (
    id BIGSERIAL PRIMARY KEY,
    pedido_id BIGINT NOT NULL REFERENCES pedidos(id),
    produto_id BIGINT NOT NULL REFERENCES produtos(id),
    quantidade INTEGER NOT NULL,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    observacao_item VARCHAR(200),
    created_at TIMESTAMP NOT NULL
);