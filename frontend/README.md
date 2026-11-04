# 💻 Fila Certa - Aplicação Web (Frontend)

Interface de usuário do **Fila Certa**, desenvolvida para atender dois públicos distintos: o cliente final (foco em experiência Mobile) e a administração do restaurante (foco em controle, segurança e monitoramento em tempo real).

## 🛠️ Tecnologias e Padrões
-   **Framework:** Angular 17+ (Standalone Components)
-   **Estilização:** Tailwind CSS (Mobile-first e Utilitário) / SCSS
-   **Reatividade:** RxJS (Observables, Subjects, Operators)
-   **Formulários:** Reactive Forms com validações nativas

## ✨ Destaques Técnicos

### 🛡️ Interceptors, Guards e RBAC (Segurança JWT)
A comunicação segura com o Backend e o roteamento interno são altamente protegidos:
-   **AuthInterceptor:** Intercepta todas as requisições HTTP de saída e anexa invisivelmente o Token JWT no cabeçalho `Authorization`. 
-   **AuthGuard:** Protege rotas base, impedindo acesso de usuários não logados.
-   **RoleGuard (Functional Guard):** Decodifica o payload do JWT em Base64 no próprio cliente, verificando permissões (`ADMIN` vs `DONO`) para impedir que a tela de Gestão de Usuários seja acessada ou renderizada indevidamente.

### 🔄 Polling, WebSockets e Reatividade
A arquitetura de atualizações de tela minimiza reloads. Telas operacionais (Fila da Cozinha e Status do Pedido) são atualizadas reativamente, oferecendo feedback instantâneo sem depender de interações do usuário.

### 👥 Gestão de Usuários
Interface administrativa completa construída com Reactive Forms para criação de novas contas de acesso, seleção de nível de privilégio (Enums) e feedback visual de erros/sucesso integrados aos códigos HTTP do backend (401, 403, etc.).

## 📂 Estrutura de Diretórios
-   `core/`: Serviços globais singleton (`AuthService`), decodificação de JWT, Guards (`roleGuard`) e Interceptors.
-   `shared/`: Componentes reutilizáveis (Modais de confirmação, Toasts, Inputs).
-   `pages/`: Componentes que representam telas inteiras (Home, Cardápio, Cozinha, Caixa, Gestão de Usuários).

## 🚀 Como Executar
1. Certifique-se de que a API (Backend) esteja rodando na porta 8080.
2. Instale as dependências:
```bash
npm install
Inicie o servidor de desenvolvimento:

Bash
ng serve
Acesse a aplicação em http://localhost:4200.
