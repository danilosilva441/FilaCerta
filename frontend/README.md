---

### 2. 💻 README do Frontend (`frontend/README.md`)

Crie o arquivo `README.md` dentro da pasta `frontend/` (ou na raiz do seu projeto Angular) e cole o código abaixo:

```markdown
# 💻 Fila Certa - Aplicação Web (Frontend)

Interface de usuário do **Fila Certa**, desenvolvida para atender dois públicos distintos: o cliente final (foco em experiência Mobile) e a administração do restaurante (foco em controle e monitoramento em tempo real).

## 🛠️ Tecnologias e Padrões
*   **Framework:** Angular 17+ (Standalone Components)
*   **Estilização:** Tailwind CSS (Mobile-first e Utilitário)
*   **Reatividade:** RxJS (Observables, Subjects, Operators)
*   **Linguagem:** TypeScript

## ✨ Destaques Técnicos

### 🔄 Polling e Reatividade (RxJS)
Para evitar o uso precoce de WebSockets complexos, o sistema implementa chamadas assíncronas em segundo plano utilizando os operadores `timer` e `switchMap` do RxJS. 
Isso permite que telas como a **Fila da Cozinha** e o **Status do Pedido** sejam atualizadas quase em tempo real sem interações do usuário, oferecendo feedback instantâneo.

### 🛡️ Interceptors e Guards (Segurança JWT)
A comunicação segura com o Backend é abstraída pelo framework:
*   **AuthInterceptor:** Intercepta todas as requisições HTTP de saída e anexa invisivelmente o Token JWT no cabeçalho `Authorization`, caso o usuário seja um administrador logado.
*   **AuthGuard:** Protege o ciclo de vida das rotas. Impede que usuários não autenticados acessem as URLs `/caixa` e `/cozinha`, redirecionando-os para a tela de login.

### 🔊 Integração com Hardware Mobile
O serviço `NotificationService` foi projetado para lidar com as restrições rigorosas dos navegadores mobile. Ele contorna bloqueios de áudio exigindo uma interação inicial (clique) para "desbloquear" a tag de áudio no Chrome/Safari, combinando notificações visuais (Toasts), sonoras (arquivos MP3 via Audio API) e físicas (Vibration API como fallback).

## 📂 Estrutura de Diretórios
*   `core/`: Serviços globais singleton (`AuthService`, `CaixaService`), Guards e Interceptors.
*   `shared/`: Componentes reutilizáveis (Modais de confirmação, Toasts).
*   `pages/`: Componentes que representam telas inteiras (Home, Cardápio, Cozinha, Caixa), organizados com rotas filhas.

## 🚀 Como Executar
1. Certifique-se de que a API (Backend) esteja rodando na porta 8080.
2. Instale as dependências:
```bash
npm install

    Inicie o servidor de desenvolvimento:

Bash

ng serve

Acesse a aplicação em http://localhost:4200.
