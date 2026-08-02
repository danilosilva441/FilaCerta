-- Adicionar campos de total concluído na tabela caixa_diario
ALTER TABLE caixa_diario ADD COLUMN IF NOT EXISTS total_concluidos INTEGER NOT NULL DEFAULT 0;
ALTER TABLE caixa_diario ADD COLUMN IF NOT EXISTS valor_total_concluidos DECIMAL(10,2) NOT NULL DEFAULT 0;