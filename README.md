# 🍔 FilaCerta - Sistema de Autoatendimento e Gestão de Pedidos

O **FilaCerta** é uma plataforma completa (End-to-End) para restaurantes, lanchonetes e food-trucks, focada em otimizar o fluxo de pedidos, reduzir filas e fornecer controle financeiro em tempo real. O sistema permite que o cliente faça o pedido via smartphone (QR Code) ou diretamente no balcão, acompanhando o status ao vivo na tela.

## 🚀 O Problema que Resolvemos
Estabelecimentos de fast-food sofrem com gargalos no caixa, erros de anotação de pedidos e falta de visibilidade da fila para a cozinha. O FilaCerta descentraliza o pedido, passando o controle para o smartphone do cliente, enquanto a cozinha e o caixa recebem atualizações instantâneas sem a necessidade de recarregar a página.

---

## 🏗️ Arquitetura e Tecnologias

O projeto adota uma arquitetura baseada em microsserviços lógicos, com separação estrita de responsabilidades entre o cliente (Frontend) e o servidor (Backend).

*   **Backend:** Java 17 + Spring Boot 3
*   **Frontend:** Angular 17+ (Standalone Components) + TailwindCSS
*   **Banco de Dados:** PostgreSQL (via Spring Data JPA)
*   **Comunicação em Tempo Real:** WebSockets (STOMP/SockJS)

---

## 🛡️ Diferenciais: Segurança e Anti-Fraude (Enterprise-Grade)

Diferente de sistemas convencionais, o FilaCerta foi desenhado com uma postura defensiva ("Security by Design") para evitar fraudes operacionais:

1.  **Vínculo de Sessão (Device Binding):** O sistema utiliza controle rígido via `localStorage` e `sessionStorage` para impedir que um cliente abra múltiplas abas e realize pedidos falsos simultâneos (Spam de fila).
2.  **Proteção contra IDOR:** Pedidos não utilizam IDs sequenciais e previsíveis na URL. O rastreio é feito por um UUID curto e cifrado (ex: `8F3A2B19`), impedindo que clientes acessem ou cancelem pedidos de terceiros.
3.  **Backend Soberano (Status Lock):** O frontend não possui poder de decisão. O Backend bloqueia automaticamente o cancelamento ou a edição de pedidos caso a cozinha já tenha alterado o status para `PREPARANDO` ou superior, garantindo **zero desperdício de insumos**.
4.  **Isolamento Financeiro (Visão Cega):** Separação estrita entre a interface Operacional (Balcão) e a Financeira (Cofre). Funcionários podem operar a fila sem ter acesso a dados sensíveis de faturamento da loja.

---

## ⚖️ Conformidade Legal (LGPD)

O FilaCerta está alinhado às diretrizes da Lei Geral de Proteção de Dados (Lei nº 13.709/2018):
*   **Minimização de Dados (Art. 6º, III):** O sistema exige apenas um "Nome ou Apelido" para identificação visual, sem coleta de CPF, e-mail, telefone ou endereço físico.
*   **Finalidade Clara (Art. 6º, I):** O dado recolhido tem a finalidade exclusiva de facilitar a chamada do pedido na entrega.

---

## ⚙️ Principais Funcionalidades

### 📱 Para o Cliente
*   **Cardápio Digital:** Navegação fluida e filtro por categorias.
*   **Modo Acréscimo (Comanda Aberta):** Clientes com pedidos já em andamento (`SERVIDO`) podem adicionar novos itens à mesma conta sem perder o contexto.
*   **Rastreamento ao Vivo:** Tela de acompanhamento sincronizada via WebSocket que atualiza instantaneamente quando a cozinha altera o status (Na Fila -> Preparando -> Pronto).

### 🍳 Para a Operação (Loja)
*   **Painel da Cozinha:** Visualização de fila priorizada e controle de preparo por item.
*   **Painel do Caixa (Balcão):** Aprovação de pagamentos, avanço de fluxo (Servir/Entregar) e botão de emergência para "Pausar Cozinha" em momentos de pico.
*   **Cofre (Financeiro):** Dashboard em tempo real com conciliação automática de recebimentos segmentados por método (PIX, Cartão, Dinheiro), volume de vendas e contagem de itens na gaveta.

---

## 🗺️ Roadmap e Próximos Passos

Apesar de ser um produto funcional e estável, as seguintes implementações estão mapeadas para o ambiente de Produção Oficial:
- [ ] **Rate Limiting** via Nginx/Bucket4j para prevenir ataques de negação de serviço.
- [ ] Tarefa automatizada (`@Scheduled`) para **Anonimização Noturna de Dados**, limpando os nomes dos clientes do banco após 24h para conformidade máxima com a LGPD.
- [ ] Relatórios PDF de fechamento de caixa.

---
*Desenvolvido com foco na eficiência, segurança e na melhor experiência do utilizador.*