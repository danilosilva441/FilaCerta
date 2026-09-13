-- 1. Categorias
CREATE TABLE categorias (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

-- 2. Produtos
CREATE TABLE produtos (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(500),
    preco DECIMAL(10, 2) NOT NULL,
    categoria_id BIGINT REFERENCES categorias(id),
    tempo_preparo_minutos INTEGER NOT NULL DEFAULT 0,
    disponivel BOOLEAN NOT NULL DEFAULT TRUE,
    quantidade_disponivel INTEGER,
    limite_diario INTEGER,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- 3. Caixa Diário
CREATE TABLE caixa_diario (
    id BIGSERIAL PRIMARY KEY,
    data DATE NOT NULL UNIQUE,
    hora_abertura TIMESTAMP NOT NULL,
    hora_fechamento TIMESTAMP,
    data_fechamento TIMESTAMP, -- Faltava no banco, mas estava na Entidade
    valor_inicial DECIMAL(10, 2),
    status VARCHAR(20) NOT NULL,
    total_dinheiro DECIMAL(10, 2) DEFAULT 0,
    total_pedidos INTEGER DEFAULT 0,
    cozinha_pausada BOOLEAN NOT NULL DEFAULT FALSE,
    motivo_pausa VARCHAR(50),
    created_at TIMESTAMP NOT NULL
);

-- 4. Pedidos
CREATE TABLE pedidos (
    id BIGSERIAL PRIMARY KEY,
    numero INTEGER NOT NULL,
    nome_cliente VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    origem VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    status_pagamento VARCHAR(20),
    forma_pagamento VARCHAR(20), -- Adicionado para evitar erro 500
    metodo_pagamento VARCHAR(20),
    valor_total DECIMAL(10, 2) DEFAULT 0,
    data_hora_pedido TIMESTAMP NOT NULL,
    data_hora_pronto TIMESTAMP,
    observacao VARCHAR(300),
    caixa_diario_id BIGINT REFERENCES caixa_diario(id)
);

-- 5. Itens do Pedido
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

-- 6. Usuários
CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ADMIN'
);