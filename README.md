# 🍔 Fila Certa (Mikael Lanches)

> **Sistema Inteligente de Autoatendimento e Gestão de Filas para Fast Food.**

O **Fila Certa** é uma solução completa de PDV (Ponto de Venda) e autoatendimento projetada para otimizar o fluxo de pedidos em lanchonetes e restaurantes. O sistema elimina gargalos de atendimento, oferecendo um cardápio digital reativo para o cliente e um painel de controle em tempo real para a gestão do caixa e da cozinha.

---

## 🚀 O Problema e a Solução

Em horários de pico, restaurantes perdem vendas devido a filas de atendimento e desorganização na cozinha. O **Fila Certa** resolve isso ao descentralizar a entrada de pedidos. 

*   **Para o Cliente:** Um cardápio digital intuitivo via QR Code ou link, onde ele monta o pedido e acompanha o status (Recebido, Preparando, Pronto) em tempo real, sem precisar instalar aplicativos.
*   **Para a Gestão:** Um painel administrativo seguro que orquestra a fila da cozinha, controla o fluxo financeiro do caixa e possui gatilhos de controle de demanda (ex: Pausar novos pedidos se a cozinha sobrecarregar).

---

## 🏗️ Arquitetura do Sistema

O projeto foi construído seguindo o padrão de **Arquitetura Desacoplada**, separando claramente as responsabilidades entre a camada de apresentação (Frontend) e as regras de negócio/persistência (Backend).

*   **Backend (API RESTful):** Desenvolvido em Java com Spring Boot. Atua como o núcleo da aplicação, garantindo segurança (Autenticação JWT), validação de regras de negócio, e transações consistentes com o banco de dados.
*   **Frontend (SPA - Single Page Application):** Desenvolvido em Angular. Consome a API REST e proporciona uma experiência *Mobile-First*, utilizando técnicas de *Polling* assíncrono via RxJS para reatividade em tempo real.

---

## 🛠️ Tecnologias Utilizadas

### Backend
*   **Java 17** & **Spring Boot 3**
*   **Spring Security & JWT** (Controle de acesso granular e rotas blindadas)
*   **Spring Data JPA / Hibernate** (Mapeamento Objeto-Relacional)
*   **Flyway** (Versionamento e migrações de Banco de Dados)
*   **Banco de Dados:** H2 (Desenvolvimento) / Preparado para PostgreSQL (Produção)

### Frontend
*   **Angular 17+** (Framework SPA, Standalone Components, Signals/RxJS)
*   **Tailwind CSS** (Estilização utilitária e design responsivo)
*   **TypeScript** (Tipagem estática e segurança no código cliente)

---

## ✨ Principais Funcionalidades

### 📱 Visão do Cliente
*   **Cardápio Digital Responsivo:** Navegação fluida e adição de itens ao carrinho.
*   **Acompanhamento em Tempo Real:** Tela de status reativa que atualiza automaticamente o progresso do pedido sem necessidade de *refresh*.
*   **Bloqueio de Alta Demanda:** Interface adaptativa que oculta o cardápio automaticamente caso a gestão pause a cozinha.

### 💻 Visão Administrativa (Acesso Restrito)
*   **Controle de Segurança:** Login via Token JWT obrigatório para áreas gerenciais.
*   **Painel do Caixa:** Abertura, fechamento, resumo financeiro (Valor Inicial, Entradas, Status de Pagamento) e cancelamento de pedidos.
*   **Fila da Cozinha (Kanban):** Tela de fluxo de preparo com integração sonora e visual, ordenando pedidos por chegada e prioridade.
*   **Emergency Stop:** Recurso de pausa da cozinha em 1 clique para horários de pico extremo.

---

## ⚙️ Como Executar o Projeto Localmente

Para rodar este projeto na sua máquina, você precisará do **Java 17+**, **Node.js (v18+)** e o **Angular CLI** instalados.

### 1. Clonando o Repositório
```bash
git clone [https://github.com/seu-usuario/filacerta.git](https://github.com/seu-usuario/filacerta.git)
cd filacerta

2. Rodando o Backend (Spring Boot)

O banco de dados (H2) e as tabelas (via Flyway) serão criadas automaticamente na inicialização.
Bash

cd backend
mvn spring-boot:run

A API estará disponível em http://localhost:8080.
3. Rodando o Frontend (Angular)

Em um novo terminal:
Bash

cd frontend
npm install
ng serve

O sistema estará disponível em http://localhost:4200.