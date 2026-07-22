-- Índices adicionais para performance
CREATE INDEX IF NOT EXISTS idx_pedido_tipo_status ON pedido(tipo, status);
CREATE INDEX IF NOT EXISTS idx_pedido_data_status ON pedido(data_hora_pedido, status);
CREATE INDEX IF NOT EXISTS idx_pedido_cliente_data ON pedido(nome_cliente, data_hora_pedido);
CREATE INDEX IF NOT EXISTS idx_pedido_caixa_data_status ON pedido(caixa_diario_data, status);