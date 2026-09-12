# ⚙️ Fila Certa - API REST (Backend)

Este é o núcleo da aplicação **Fila Certa**, responsável por todo o processamento de regras de negócio, persistência de dados e segurança. Foi construído como uma API RESTful utilizando o ecossistema Spring.

## 🛠️ Tecnologias e Arquitetura
*   **Linguagem:** Java 17
*   **Framework Principal:** Spring Boot 3
*   **Segurança:** Spring Security + Auth0 Java JWT (Tokens Stateless)
*   **Persistência:** Spring Data JPA / Hibernate
*   **Versionamento de Banco:** Flyway
*   **Banco de Dados:** H2 (Perfil Dev)

O projeto adota uma **Arquitetura em Camadas (Layered Architecture)**, separando responsabilidades de forma clara:
*   `controller`: Exposição dos endpoints REST e roteamento HTTP.
*   `application/dto`: Data Transfer Objects para entrada e saída de dados, evitando exposição direta de entidades.
*   `domain`: Entidades core do banco de dados e Enums.
*   `infrastructure`: Repositórios JPA e configurações de Segurança (Filtros JWT, CORS).
*   `service`: Regras de negócio, cálculos financeiros e orquestração.

## 🛡️ Segurança e Autenticação
A API utiliza autenticação baseada em **Tokens JWT (JSON Web Tokens)**.
A configuração (`SecurityConfig`) divide os acessos em:
1.  **Rotas Públicas (`permitAll`):** `/api/produtos`, `/api/pedidos`, `/api/caixa/atual`. Permitem a navegação e criação de pedidos pelo cliente final. Preflight requests (`OPTIONS`) estão liberados para mitigar problemas de CORS.
2.  **Rotas Privadas (`authenticated`):** `/api/caixa/**`, `/api/cozinha/**`. Protegidas pelo `SecurityFilter`, exigem um header `Authorization: Bearer <token>`.

## 🗄️ Versionamento de Banco (Flyway)
O estado do banco de dados é controlado estritamente via Flyway (`src/main/resources/db/migration`).
O banco é inicializado automaticamente com:
*   Estruturas de tabelas (Caixa, Pedidos, Itens, Produtos).
*   Tabela de `usuarios` e injeção do usuário Master de administração inicial.

## 🚀 Como Executar
1. Certifique-se de estar na pasta raiz do backend.
2. O Maven fará o download das dependências e o Flyway montará o banco H2.
```bash
mvn clean install
mvn spring-boot:run

A API estará acessível em http://localhost:8080/api/.