CREATE TABLE produtos (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(500),
    preco DECIMAL(10, 2) NOT NULL,
    categoria VARCHAR(30) NOT NULL,
    tempo_preparo_minutos INTEGER NOT NULL DEFAULT 0,
    disponivel BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- Seed inicial de produtos
INSERT INTO produtos (nome, descricao, preco, categoria, tempo_preparo_minutos, disponivel, created_at) VALUES 
('X-Burger', 'Pão, carne e queijo', 15.00, 'HAMBURGUER', 10, true, CURRENT_TIMESTAMP),
('X-Salada', 'Pão, carne, queijo, alface e tomate', 18.00, 'HAMBURGUER', 10, true, CURRENT_TIMESTAMP),
('Hot Dog', 'Pão, salsicha, batata palha e molhos', 12.00, 'CACHORRO_QUENTE', 4, true, CURRENT_TIMESTAMP),
('Refrigerante Lata', 'Coca-cola, Guaraná', 7.00, 'BEBIDA', 0, true, CURRENT_TIMESTAMP);