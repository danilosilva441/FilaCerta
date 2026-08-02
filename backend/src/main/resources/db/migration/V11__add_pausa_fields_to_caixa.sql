-- Adicionar campos de pausa na tabela caixa_diario
ALTER TABLE caixa_diario ADD COLUMN IF NOT EXISTS hora_pausa TIME;
ALTER TABLE caixa_diario ADD COLUMN IF NOT EXISTS hora_reativacao TIME;
ALTER TABLE caixa_diario ADD COLUMN IF NOT EXISTS motivo_pausa VARCHAR(200);
ALTER TABLE caixa_diario ADD COLUMN IF NOT EXISTS tempo_estimado_retorno VARCHAR(50);

-- Atualizar o CHECK constraint do status para incluir PAUSADO
ALTER TABLE caixa_diario DROP CONSTRAINT IF EXISTS caixa_diario_status_check;
ALTER TABLE caixa_diario ADD CONSTRAINT caixa_diario_status_check 
    CHECK (status IN ('ABERTO', 'PAUSADO', 'FECHADO'));