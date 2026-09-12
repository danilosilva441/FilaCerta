CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ADMIN'
);

-- Inserindo o usuário de acesso ao sistema
INSERT INTO usuarios (username, password, role) 
VALUES ('admin', 'rochedo123', 'ADMIN');