# ⚙️ Fila Certa - API REST (Backend)

Este é o núcleo da aplicação **Fila Certa**, responsável por todo o processamento de regras de negócio, persistência de dados e segurança. Foi construído como uma API RESTful utilizando o ecossistema Spring, otimizado para deploy contínuo no Railway.

## 🛠️ Tecnologias e Arquitetura
-   **Linguagem:** Java 17
-   **Framework Principal:** Spring Boot 3.2
-   **Segurança:** Spring Security + Auth0 Java JWT (Tokens Stateless)
-   **Persistência:** Spring Data JPA / Hibernate
-   **Banco de Dados:** PostgreSQL (Produção) / H2 (Desenvolvimento)

O projeto adota uma **Arquitetura em Camadas (Layered Architecture)**, separando responsabilidades de forma clara:
-   `controller`: Exposição dos endpoints REST e roteamento HTTP.
-   `application/dto`: Data Transfer Objects para entrada e saída de dados.
-   `domain`: Entidades core do banco de dados e Enums de segurança (`Role.ADMIN`, `Role.DONO`).
-   `infrastructure`: Repositórios JPA e configurações dinâmicas.
-   `config/security`: Filtros JWT, CORS, Limitadores de Requisição e validação de sessão.
-   `service`: Regras de negócio e orquestração.

## 🛡️ Segurança e Autenticação (RBAC)
A API utiliza autenticação baseada em **Tokens JWT (JSON Web Tokens)** associada a um sistema forte de controle de versão de sessão.
-   **Injeção de Perfil no Token:** A função (Role) do usuário é gravada como Enum e injetada no payload do JWT no momento do login.
-   **Filtro Dinâmico:** O `SecurityFilter` intercepta a requisição, lê a versão e a Role do token, compara com a versão atual no banco, e delega as permissões de forma estrita para o contexto do Spring (ex: `@PreAuthorize("hasRole('ADMIN')")`).
-   **Separação de Rotas:** 
    1.  **Públicas (`permitAll`):** `/api/produtos`, `/api/pedidos`, `/api/auth/login`. Preflight requests (`OPTIONS`) estão liberados.
    2.  **Privadas (`authenticated`):** Exigem header `Authorization: Bearer <token>`.

## 🗄️ Estratégia de Banco de Dados (PostgreSQL no Railway)
Para garantir compatibilidade imediata com versões ultra-recentes de bancos na nuvem (PostgreSQL 18+ geridos pelo Railway), a dependência do Flyway foi desabilitada em produção.
- O mapeamento e a criação/atualização de tabelas (DDL) são geridos de forma soberana pelo **Hibernate** (`spring.jpa.hibernate.ddl-auto=update`).
- Credenciais e URLs de conexão são injetadas dinamicamente via variáveis de ambiente do Railway (`${PGHOST}`, `${PGPORT}`, etc.).

## 🚀 Como Executar Localmente
1. Certifique-se de estar na pasta raiz do backend.
2. O Maven fará o download das dependências e subirá o banco H2 em memória.
```bash
mvn clean install
mvn spring-boot:run

A API estará acessível em http://localhost:8080/api/.