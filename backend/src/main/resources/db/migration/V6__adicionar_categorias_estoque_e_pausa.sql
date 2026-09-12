-- Criar tabela de categorias
CREATE TABLE categorias (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

-- Inserir categoria padrão para não quebrar produtos existentes
INSERT INTO categorias (nome) VALUES ('Geral');

-- Atualizar tabela de produtos
ALTER TABLE produtos
ADD COLUMN categoria_id BIGINT DEFAULT 1,
ADD COLUMN quantidade_disponivel INT NULL,
ADD COLUMN limite_diario INT NULL,
ADD COLUMN ativo BOOLEAN DEFAULT TRUE;

ALTER TABLE produtos
ADD CONSTRAINT fk_produto_categoria
FOREIGN KEY (categoria_id) REFERENCES categorias(id);

-- Atualizar tabela do caixa para a nova pausa
ALTER TABLE caixa_diario
ADD COLUMN motivo_pausa VARCHAR(50) NULL;