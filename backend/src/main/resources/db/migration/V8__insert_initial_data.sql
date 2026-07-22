-- ============================================
-- DADOS INICIAIS - PRODUTOS
-- ============================================

-- Hamburguers
INSERT INTO produto (nome, descricao, preco, categoria, tempo_preparo_minutos) 
SELECT 'X-Burger', 'Pão, hambúrguer, queijo, alface e tomate', 15.90, 'HAMBURGUER', 10
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE nome = 'X-Burger');

INSERT INTO produto (nome, descricao, preco, categoria, tempo_preparo_minutos) 
SELECT 'X-Bacon', 'Pão, hambúrguer, queijo, bacon, alface e tomate', 19.90, 'HAMBURGUER', 12
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE nome = 'X-Bacon');

INSERT INTO produto (nome, descricao, preco, categoria, tempo_preparo_minutos) 
SELECT 'X-Tudo', 'Pão, hambúrguer, queijo, bacon, ovo, alface e tomate', 24.90, 'HAMBURGUER', 15
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE nome = 'X-Tudo');

INSERT INTO produto (nome, descricao, preco, categoria, tempo_preparo_minutos) 
SELECT 'X-Salada', 'Pão, hambúrguer, queijo, alface, tomate e maionese', 17.90, 'HAMBURGUER', 10
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE nome = 'X-Salada');

INSERT INTO produto (nome, descricao, preco, categoria, tempo_preparo_minutos) 
SELECT 'X-Egg', 'Pão, hambúrguer, queijo, ovo, alface e tomate', 18.90, 'HAMBURGUER', 12
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE nome = 'X-Egg');

-- Cachorros Quentes
INSERT INTO produto (nome, descricao, preco, categoria, tempo_preparo_minutos) 
SELECT 'Hot Dog Simples', 'Pão, salsicha, molho, batata palha', 12.90, 'CACHORRO_QUENTE', 5
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE nome = 'Hot Dog Simples');

INSERT INTO produto (nome, descricao, preco, categoria, tempo_preparo_minutos) 
SELECT 'Hot Dog Completo', 'Pão, salsicha, molho, batata palha, queijo, bacon', 16.90, 'CACHORRO_QUENTE', 7
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE nome = 'Hot Dog Completo');

INSERT INTO produto (nome, descricao, preco, categoria, tempo_preparo_minutos) 
SELECT 'Hot Dog Especial', 'Pão, salsicha, molho, batata palha, queijo, bacon, ovo', 18.90, 'CACHORRO_QUENTE', 8
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE nome = 'Hot Dog Especial');

-- Salgados
INSERT INTO produto (nome, descricao, preco, categoria, tempo_preparo_minutos) 
SELECT 'Coxinha', 'Massa de batata recheada com frango', 6.90, 'SALGADO', 8
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE nome = 'Coxinha');

INSERT INTO produto (nome, descricao, preco, categoria, tempo_preparo_minutos) 
SELECT 'Pastel de Carne', 'Massa frita recheada com carne moída', 7.90, 'SALGADO', 8
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE nome = 'Pastel de Carne');

INSERT INTO produto (nome, descricao, preco, categoria, tempo_preparo_minutos) 
SELECT 'Empada de Frango', 'Massa recheada com frango e milho', 6.90, 'SALGADO', 8
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE nome = 'Empada de Frango');

INSERT INTO produto (nome, descricao, preco, categoria, tempo_preparo_minutos) 
SELECT 'Risole de Camarão', 'Massa recheada com camarão e catupiry', 8.90, 'SALGADO', 10
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE nome = 'Risole de Camarão');

INSERT INTO produto (nome, descricao, preco, categoria, tempo_preparo_minutos) 
SELECT 'Kibe', 'Kibe frito recheado com carne', 6.90, 'SALGADO', 7
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE nome = 'Kibe');

-- Bebidas
INSERT INTO produto (nome, descricao, preco, categoria, tempo_preparo_minutos) 
SELECT 'Coca-Cola Lata', 'Coca-Cola lata 350ml', 5.90, 'BEBIDA', 0
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE nome = 'Coca-Cola Lata');

INSERT INTO produto (nome, descricao, preco, categoria, tempo_preparo_minutos) 
SELECT 'Coca-Cola 2L', 'Coca-Cola 2 litros', 9.90, 'BEBIDA', 0
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE nome = 'Coca-Cola 2L');

INSERT INTO produto (nome, descricao, preco, categoria, tempo_preparo_minutos) 
SELECT 'Coca-Cola Zero Lata', 'Coca-Cola Zero lata 350ml', 5.90, 'BEBIDA', 0
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE nome = 'Coca-Cola Zero Lata');

INSERT INTO produto (nome, descricao, preco, categoria, tempo_preparo_minutos) 
SELECT 'Guaraná Lata', 'Guaraná Antárctica lata 350ml', 5.50, 'BEBIDA', 0
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE nome = 'Guaraná Lata');

INSERT INTO produto (nome, descricao, preco, categoria, tempo_preparo_minutos) 
SELECT 'Suco Natural', 'Suco de fruta natural (laranja, limão, maracujá)', 7.90, 'BEBIDA', 5
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE nome = 'Suco Natural');

INSERT INTO produto (nome, descricao, preco, categoria, tempo_preparo_minutos) 
SELECT 'Água Mineral', 'Água mineral 500ml', 3.90, 'BEBIDA', 0
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE nome = 'Água Mineral');

INSERT INTO produto (nome, descricao, preco, categoria, tempo_preparo_minutos) 
SELECT 'Água com Gás', 'Água mineral com gás 500ml', 4.50, 'BEBIDA', 0
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE nome = 'Água com Gás');

-- Porções
INSERT INTO produto (nome, descricao, preco, categoria, tempo_preparo_minutos) 
SELECT 'Porção de Batata Frita', 'Batata frita crocante para 2 pessoas', 18.90, 'PORCAO', 12
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE nome = 'Porção de Batata Frita');

INSERT INTO produto (nome, descricao, preco, categoria, tempo_preparo_minutos) 
SELECT 'Porção de Onion Rings', 'Anéis de cebola empanados', 16.90, 'PORCAO', 10
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE nome = 'Porção de Onion Rings');

INSERT INTO produto (nome, descricao, preco, categoria, tempo_preparo_minutos) 
SELECT 'Porção de Batata com Cheddar', 'Batata frita com cheddar e bacon', 22.90, 'PORCAO', 14
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE nome = 'Porção de Batata com Cheddar');

INSERT INTO produto (nome, descricao, preco, categoria, tempo_preparo_minutos) 
SELECT 'Porção de Frango', 'Tiras de frango empanadas', 19.90, 'PORCAO', 12
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE nome = 'Porção de Frango');

-- Adicionais
INSERT INTO produto (nome, descricao, preco, categoria, tempo_preparo_minutos) 
SELECT 'Queijo Extra', 'Camada extra de queijo', 3.00, 'ADICIONAL', 0
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE nome = 'Queijo Extra');

INSERT INTO produto (nome, descricao, preco, categoria, tempo_preparo_minutos) 
SELECT 'Bacon Extra', 'Camada extra de bacon', 4.00, 'ADICIONAL', 0
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE nome = 'Bacon Extra');

INSERT INTO produto (nome, descricao, preco, categoria, tempo_preparo_minutos) 
SELECT 'Ovo Extra', 'Ovo frito adicional', 2.50, 'ADICIONAL', 2
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE nome = 'Ovo Extra');

INSERT INTO produto (nome, descricao, preco, categoria, tempo_preparo_minutos) 
SELECT 'Cheddar Extra', 'Camada extra de cheddar', 3.50, 'ADICIONAL', 0
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE nome = 'Cheddar Extra');

INSERT INTO produto (nome, descricao, preco, categoria, tempo_preparo_minutos) 
SELECT 'Molho Especial', 'Molho especial da casa', 2.00, 'ADICIONAL', 0
WHERE NOT EXISTS (SELECT 1 FROM produto WHERE nome = 'Molho Especial');

-- ============================================
-- CAIXA DIÁRIO INICIAL
-- ============================================

INSERT INTO caixa_diario (data, hora_abertura, valor_inicial, status) 
SELECT CURRENT_DATE, CURRENT_TIME, 100.00, 'ABERTO'
WHERE NOT EXISTS (SELECT 1 FROM caixa_diario WHERE data = CURRENT_DATE);