-- Categorias (pule se já inseriu)
INSERT INTO categorias (nome) VALUES ('Lanches'), ('Sucos');

-- Lanches
INSERT INTO produtos (nome, descricao, preco, categoria_id, tempo_preparo_minutos, disponivel, ativo, versao, created_at) VALUES
('Cachorro Quente', 'Pão, salsicha, verdura, milho, ervilha e batata palha', 4.00, (SELECT id FROM categorias WHERE nome = 'Lanches'), 0, TRUE, TRUE, 0, CURRENT_TIMESTAMP),
('Pão com Charque', 'Pão, charque, verdura, milho, ervilha e batata palha', 0.00, (SELECT id FROM categorias WHERE nome = 'Lanches'), 0, FALSE, TRUE, 0, CURRENT_TIMESTAMP), -- preço marcado com X no cardápio; atualizar
('Hambúrguer', 'Pão, hambúrguer, verdura, milho, ervilha e batata palha', 5.00, (SELECT id FROM categorias WHERE nome = 'Lanches'), 0, TRUE, TRUE, 0, CURRENT_TIMESTAMP),
('X-Egg', 'Pão, hambúrguer, ovo, queijo, verdura, milho, ervilha e batata palha', 8.00, (SELECT id FROM categorias WHERE nome = 'Lanches'), 0, TRUE, TRUE, 0, CURRENT_TIMESTAMP),
('X-Frango', 'Pão, hambúrguer, frango, queijo, verdura, milho, ervilha e batata palha', 8.00, (SELECT id FROM categorias WHERE nome = 'Lanches'), 0, TRUE, TRUE, 0, CURRENT_TIMESTAMP),
('X-Calabresa', 'Pão, hambúrguer, calabresa, queijo, verdura, milho, ervilha e batata palha', 10.00, (SELECT id FROM categorias WHERE nome = 'Lanches'), 0, TRUE, TRUE, 0, CURRENT_TIMESTAMP),
('X-Bacon', 'Pão, hambúrguer, bacon, queijo, presunto, verdura, milho, ervilha e batata palha', 10.00, (SELECT id FROM categorias WHERE nome = 'Lanches'), 0, TRUE, TRUE, 0, CURRENT_TIMESTAMP),
('X-Tudo', 'Pão, hambúrguer, ovo, salsicha, queijo, presunto, verdura, milho, ervilha e batata palha', 10.00, (SELECT id FROM categorias WHERE nome = 'Lanches'), 0, TRUE, TRUE, 0, CURRENT_TIMESTAMP),
('Egg Burguer', 'Pão, hambúrguer, ovo, salsicha, verdura, milho, ervilha e batata palha', 8.00, (SELECT id FROM categorias WHERE nome = 'Lanches'), 0, TRUE, TRUE, 0, CURRENT_TIMESTAMP);

-- Sucos
INSERT INTO produtos (nome, descricao, preco, categoria_id, tempo_preparo_minutos, disponivel, ativo, versao, created_at) VALUES
('Suco de Acerola com Beterraba', 'Suco natural', 2.00, (SELECT id FROM categorias WHERE nome = 'Sucos'), 0, TRUE, TRUE, 0, CURRENT_TIMESTAMP),
('Suco de Maracujá', 'Suco natural', 2.00, (SELECT id FROM categorias WHERE nome = 'Sucos'), 0, TRUE, TRUE, 0, CURRENT_TIMESTAMP),
('Suco de Goiaba', 'Suco natural', 2.00, (SELECT id FROM categorias WHERE nome = 'Sucos'), 0, TRUE, TRUE, 0, CURRENT_TIMESTAMP),
('Suco de Caju', 'Suco natural', 2.00, (SELECT id FROM categorias WHERE nome = 'Sucos'), 0, TRUE, TRUE, 0, CURRENT_TIMESTAMP);



	-- 4. Caixa Diário
	-- Status FECHADO é recomendado para que o dono consiga digitar o "Troco Inicial" pela tela no início do dia.
	INSERT INTO caixa_diario (data, hora_abertura, status, created_at)
	VALUES (CURRENT_DATE, CURRENT_TIMESTAMP, 'FECHADO', CURRENT_TIMESTAMP);