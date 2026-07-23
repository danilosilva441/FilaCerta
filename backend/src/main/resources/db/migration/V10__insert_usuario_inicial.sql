-- ============================================
-- USUÁRIO INICIAL (DONO)
-- ============================================
INSERT INTO usuario (username, password, nome, tipo) 
SELECT 'dono', '123456', 'Dono do Estabelecimento', 'DONO'
WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE username = 'dono');

INSERT INTO usuario (username, password, nome, tipo) 
SELECT 'admin', '123456', 'Administrador', 'DONO'
WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE username = 'admin');

INSERT INTO usuario (username, password, nome, tipo) 
SELECT 'funcionario', '123456', 'Funcionário 1', 'FUNCIONARIO'
WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE username = 'funcionario');

-- ============================================
-- VERIFICAR USUÁRIOS CRIADOS
-- ============================================
SELECT username, nome, tipo FROM usuario;