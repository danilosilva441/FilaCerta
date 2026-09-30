ALTER TABLE pedidos ADD COLUMN codigo_acompanhamento VARCHAR(20);
-- Adiciona um índice para a busca ser instantânea
CREATE UNIQUE INDEX idx_pedidos_codigo ON pedidos(codigo_acompanhamento);