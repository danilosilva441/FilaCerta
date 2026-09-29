-- Adiciona a coluna para controlar a versão da sessão do usuário
ALTER TABLE usuarios ADD COLUMN versao_token INTEGER NOT NULL DEFAULT 0;