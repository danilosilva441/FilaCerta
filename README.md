# 🍔 Fila Certa - Sistema de Autoatendimento e Gestão de Pedidos

O **FilaCerta** é uma plataforma completa (End-to-End) para restaurantes, lanchonetes e food-trucks, focada em otimizar o fluxo de pedidos, reduzir filas e fornecer controle financeiro em tempo real. O sistema permite que o cliente faça o pedido via smartphone (QR Code) ou diretamente no balcão, acompanhando o status ao vivo na tela.

Atualmente em produção no endereço: [mikael-lanches.dssystech.com](https://mikael-lanches.dssystech.com) - servindo como vitrine arquitetural SaaS da **DS SysTech**.

## 🚀 O Problema que Resolvemos
Estabelecimentos de fast-food sofrem com gargalos no caixa, erros de anotação de pedidos e falta de visibilidade da fila para a cozinha. O FilaCerta descentraliza o pedido, passando o controle para o smartphone do cliente, enquanto a cozinha e o caixa recebem atualizações instantâneas sem a necessidade de recarregar a página.

---

## 🏗️ Arquitetura e Tecnologias

O projeto adota uma arquitetura baseada em microsserviços lógicos, com separação estrita de responsabilidades entre o cliente (Frontend) e o servidor (Backend).

-   **Backend:** Java 17 + Spring Boot 3.2
-   **Frontend:** Angular 17+ (Standalone Components) + TailwindCSS
-   **Banco de Dados:** PostgreSQL 18+ (Produção via Railway) / H2 (Desenvolvimento)
-   **Segurança:** JWT com Role-Based Access Control (RBAC via Enums)
-   **Hospedagem:** Railway App

---

## 🛡️ Diferenciais: Segurança e Anti-Fraude (Enterprise-Grade)

Diferente de sistemas convencionais, o FilaCerta foi desenhado com uma postura defensiva ("Security by Design") para evitar fraudes operacionais:

1.  **Role-Based Access Control (RBAC) Forte:** Perfis de acesso (`ADMIN` e `DONO`) definidos via Enums estritos no banco e injetados diretamente no payload do JWT, com interceptação via `SecurityFilter` e `RoleGuard` no Frontend.
2.  **Vínculo de Sessão (Device Binding):** O sistema utiliza controle rígido via tokens versionados (`versao_token`). Se a mesma conta logar em outro dispositivo e alterar dados, a sessão anterior é automaticamente invalidada.
3.  **Proteção contra IDOR:** Pedidos não utilizam IDs sequenciais e previsíveis na URL. O rastreio é feito por um UUID curto e cifrado (ex: `8F3A2B19`), impedindo que clientes acessem pedidos de terceiros.
4.  **Backend Soberano (Status Lock):** O frontend não possui poder de decisão. O Backend bloqueia automaticamente o cancelamento ou a edição de pedidos caso a cozinha já tenha alterado o status para `PREPARANDO` ou superior.
5.  **Isolamento Financeiro:** Separação estrita entre a interface Operacional (Balcão) e a Financeira (Cofre), garantindo que apenas perfis autorizados visualizem métricas de faturamento.

---

## ⚖️ Conformidade Legal (LGPD)

O FilaCerta está alinhado às diretrizes da Lei Geral de Proteção de Dados (Lei nº 13.709/2018):
-   **Minimização de Dados (Art. 6º, III):** O sistema exige apenas um "Nome ou Apelido" para identificação visual, sem coleta de CPF, e-mail, telefone ou endereço físico.
-   **Finalidade Clara (Art. 6º, I):** O dado recolhido tem a finalidade exclusiva de facilitar a chamada do pedido na entrega.

---

## 🗺️ Roadmap e Próximos Passos

Implementações focadas em escalabilidade, observabilidade e estabilidade para o ambiente de Produção Oficial:
- [ ] **Observabilidade e Health Checks:** Implementação do Spring Boot Actuator para monitorar consumo de RAM, CPU e garantir tempos de resposta (latency) abaixo de 1 segundo.
- [ ] **Circuit Breakers & Rate Limiting:** Proteção de sobrecarga em dias de pico usando Bucket4j/Resilience4j.
- [ ] Tarefa automatizada (`@Scheduled`) para **Anonimização Noturna de Dados**, limpando nomes de clientes após 24h.
- [ ] Relatórios PDF automáticos de fechamento de caixa.

---
*Desenvolvido com foco na eficiência, segurança e na melhor experiência do utilizador.*