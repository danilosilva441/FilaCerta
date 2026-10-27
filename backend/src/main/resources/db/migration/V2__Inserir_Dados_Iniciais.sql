	-- 1. Categorias Iniciais
	INSERT INTO categorias (nome) VALUES 
	('Lanches'), 
	('Bebidas'), 
	('Porções');
	
	-- 2. Produtos (Sem duplicações, com a coluna VERSAO adicionada no final)
	INSERT INTO produtos (nome, descricao, preco, categoria_id, tempo_preparo_minutos, disponivel, versao, created_at) VALUES 
	('Cachorro Quente', 'Pão, salsicha, verduras, milho, ervilha e batata palha.', 4.00, 1, 5, true, 0, CURRENT_TIMESTAMP),
	('Pão com Charque', 'Pão, charque, verduras, milho, ervilha e batata palha.', 4.00, 3, 5, true, 0, CURRENT_TIMESTAMP),
	('Hamburguer', 'Pão, hamburguer, verduras, milho, ervilha e batata palha.', 5.00, 1, 10, true, 0, CURRENT_TIMESTAMP),
	('X-Egg', 'Pão, hamburguer, ovo, queijo, verduras, milho, ervilha e batata palha.', 0.00, 1, 12, false, 0, CURRENT_TIMESTAMP),
	('X-Frango', 'Pão, hamburguer, frango, queijo, verduras, milho, ervilha e batata palha.', 8.00, 1, 12, true, 0, CURRENT_TIMESTAMP),
	('X-Calabresa', 'Pão, hamburguer, calabresa, queijo, verduras, milho, ervilha e batata palha.', 8.00, 1, 12, true, 0, CURRENT_TIMESTAMP),
	('X-Bacon', 'Pão, hamburguer, bacon, queijo, verduras, milho, ervilha e batata palha.', 10.00, 1, 12, true, 0, CURRENT_TIMESTAMP),
	('X-Tudo', 'Pão, hamburguer, ovo, salsicha, queijo, presunto, verduras, milho, ervilha e batata palha.', 10.00, 1, 15, true, 0, CURRENT_TIMESTAMP),
	('Egg Burguer', 'Pão, hamburguer, ovo, salsicha, queijo, presunto, verduras, milho, ervilha e batata palha.', 10.00, 1, 15, true, 0, CURRENT_TIMESTAMP),
	('Suco de Acerola com Beterraba', 'Suco natural de acerola com beterraba.', 8.00, 2, 2, true, 0, CURRENT_TIMESTAMP),
	('Suco de Maracujá', 'Suco natural de maracujá.', 8.00, 2, 2, true, 0, CURRENT_TIMESTAMP),
	('Suco de Goiaba-Cajú', 'Suco natural de goiaba com cajú.', 8.00, 2, 2, true, 0, CURRENT_TIMESTAMP);
	

	-- 4. Caixa Diário
	-- Status FECHADO é recomendado para que o dono consiga digitar o "Troco Inicial" pela tela no início do dia.
	INSERT INTO caixa_diario (data, hora_abertura, status, created_at)
	VALUES (CURRENT_DATE, CURRENT_TIMESTAMP, 'FECHADO', CURRENT_TIMESTAMP);