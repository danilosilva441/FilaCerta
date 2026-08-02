-- Criar extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar usuário adicional se necessário
-- CREATE USER filacerta_app WITH PASSWORD 'app_password';

-- Conceder privilégios
GRANT ALL PRIVILEGES ON DATABASE filacerta TO filacerta;