# Modelagem do Domínio - Fila Certa

## Diagrama Entidade-Relacionamento (DER)

```mermaid
erDiagram
    Produto ||--o{ ItemPedido : "possui"
    Pedido ||--o{ ItemPedido : "contém"
    Pedido ||--|| ComandaPedido : "vincula"
    Comanda ||--o{ ComandaPedido : "agrupa"
    Pedido }o--|| CaixaDiario : "registra"

    Produto {
        Long id PK
        String nome
        String descricao
        BigDecimal preco
        CategoriaProduto categoria
        Integer tempoPreparoMinutos
        Boolean disponivel
        LocalDateTime createdAt
        LocalDateTime updatedAt
    }

    Pedido {
        Long id PK
        Integer numero
        String nomeCliente
        TipoPedido tipo
        OrigemPedido origem
        StatusPedido status
        StatusPagamento statusPagamento
        MetodoPagamento metodoPagamento
        BigDecimal valorTotal
        LocalDateTime dataHoraPedido
        LocalDateTime dataHoraPronto
        LocalDateTime dataHoraEntrega
        LocalDateTime dataHoraPagamento
        String observacao
        LocalDateTime createdAt
        LocalDateTime updatedAt
    }

    ItemPedido {
        Long id PK
        Integer quantidade
        BigDecimal precoUnitario
        StatusItemPedido status
        String observacaoItem
        LocalDateTime createdAt
        Long pedido_id FK
        Long produto_id FK
    }

    Comanda {
        Long id PK
        String codigo
        String nomeCliente
        Integer mesa
        StatusComanda status
        BigDecimal valorTotal
        LocalDateTime abertura
        LocalDateTime fechamento
        LocalDateTime createdAt
    }

    ComandaPedido {
        Long id PK
        LocalDateTime createdAt
        Long comanda_id FK
        Long pedido_id FK
    }

    CaixaDiario {
        Long id PK
        LocalDate data
        LocalTime horaAbertura
        LocalTime horaFechamento
        BigDecimal valorInicial
        StatusCaixa status
        BigDecimal totalDinheiro
        BigDecimal totalDebito
        BigDecimal totalCredito
        BigDecimal totalPix
        BigDecimal totalFiado
        Integer totalPedidos
        Integer totalCancelados
        LocalDateTime createdAt
    }
    
    Especificação das Entidades
1. Produto
Representa os itens disponíveis para venda no estabelecimento.

Atributo	Tipo	Obrigatório	Restrições	Descrição
id	Long	Sim	PK, auto-increment	Identificador único
nome	String	Sim	max 100	Nome do produto
descricao	String	Não	max 500	Descrição detalhada
preco	BigDecimal	Sim	precision 10, scale 2	Preço unitário
categoria	Enum	Sim	-	Categoria do produto
tempoPreparoMinutos	Integer	Sim	default 0	Tempo médio de preparo
disponivel	Boolean	Sim	default true	Disponibilidade para venda
createdAt	LocalDateTime	Sim	-	Data de criação
updatedAt	LocalDateTime	Não	-	Data da última atualização
Categorias possíveis:

HAMBURGUER

CACHORRO_QUENTE

SALGADO

BEBIDA

PORCAO

ADICIONAL

2. Pedido
Representa um pedido realizado por um cliente.

Atributo	Tipo	Obrigatório	Restrições	Descrição
id	Long	Sim	PK, auto-increment	Identificador único
numero	Integer	Sim	único por dia	Número sequencial do pedido
nomeCliente	String	Sim	max 100	Nome do cliente
tipo	Enum	Sim	-	Tipo de consumo
origem	Enum	Sim	-	Origem do pedido
status	Enum	Sim	-	Status atual do pedido
statusPagamento	Enum	Sim	-	Status do pagamento
metodoPagamento	Enum	Não	-	Método de pagamento
valorTotal	BigDecimal	Sim	precision 10, scale 2	Valor total calculado
dataHoraPedido	LocalDateTime	Sim	-	Momento do pedido
dataHoraPronto	LocalDateTime	Não	-	Momento que ficou pronto
dataHoraEntrega	LocalDateTime	Não	-	Momento da entrega
dataHoraPagamento	LocalDateTime	Não	-	Momento do pagamento
observacao	String	Não	max 300	Observações gerais
createdAt	LocalDateTime	Sim	-	Data de criação
updatedAt	LocalDateTime	Não	-	Data da última atualização
Enums:

Tipo: LEVAR, COMER_AQUI

Origem: QR_CODE, MANUAL

Status: RECEBIDO, PREPARANDO, PRONTO, ENTREGUE, CANCELADO

StatusPagamento: AGUARDANDO, PAGO, FIADO

MetodoPagamento: DINHEIRO, CARTAO_DEBITO, CARTAO_CREDITO, PIX, FIADO

3. ItemPedido
Representa cada item dentro de um pedido.

Atributo	Tipo	Obrigatório	Restrições	Descrição
id	Long	Sim	PK, auto-increment	Identificador único
pedido	Pedido	Sim	ManyToOne	Pedido associado
produto	Produto	Sim	ManyToOne	Produto associado
quantidade	Integer	Sim	min 1	Quantidade do produto
precoUnitario	BigDecimal	Sim	precision 10, scale 2	Preço na venda
status	Enum	Sim	-	Status do item
observacaoItem	String	Não	max 200	Observações específicas
createdAt	LocalDateTime	Sim	-	Data de criação
Status possíveis:

PENDENTE

PREPARANDO

PRONTO

4. Comanda
Representa uma mesa/comanda para pedidos de consumo local.

Atributo	Tipo	Obrigatório	Restrições	Descrição
id	Long	Sim	PK, auto-increment	Identificador único
codigo	String	Sim	único	Código formatado "M" + sequencial
nomeCliente	String	Sim	max 100	Nome do cliente
mesa	Integer	Não	-	Número da mesa
status	Enum	Sim	-	Status da comanda
valorTotal	BigDecimal	Sim	precision 10, scale 2	Valor total acumulado
abertura	LocalDateTime	Sim	-	Data de abertura
fechamento	LocalDateTime	Não	-	Data de fechamento
createdAt	LocalDateTime	Sim	-	Data de criação
Status possíveis:

ABERTA

FECHADA

5. ComandaPedido
Entidade de relacionamento entre Comanda e Pedido.

Atributo	Tipo	Obrigatório	Restrições	Descrição
id	Long	Sim	PK, auto-increment	Identificador único
comanda	Comanda	Sim	ManyToOne	Comanda associada
pedido	Pedido	Sim	OneToOne	Pedido associado
createdAt	LocalDateTime	Sim	-	Data de criação
6. CaixaDiario
Registro diário das operações financeiras.

Atributo	Tipo	Obrigatório	Restrições	Descrição
id	Long	Sim	PK, auto-increment	Identificador único
data	LocalDate	Sim	único	Data do caixa
horaAbertura	LocalTime	Sim	-	Horário de abertura
horaFechamento	LocalTime	Não	-	Horário de fechamento
valorInicial	BigDecimal	Sim	precision 10, scale 2	Valor inicial em caixa
status	Enum	Sim	-	Status do caixa
totalDinheiro	BigDecimal	Sim	default 0	Total em dinheiro
totalDebito	BigDecimal	Sim	default 0	Total em débito
totalCredito	BigDecimal	Sim	default 0	Total em crédito
totalPix	BigDecimal	Sim	default 0	Total em PIX
totalFiado	BigDecimal	Sim	default 0	Total fiado
totalPedidos	Integer	Sim	default 0	Total de pedidos
totalCancelados	Integer	Sim	default 0	Total cancelados
createdAt	LocalDateTime	Sim	-	Data de criação
Status possíveis:

ABERTO

FECHADO

Regras de Negócio
RN01 - Numeração Sequencial de Pedidos
O número do pedido é gerado automaticamente

É sequencial por dia (inicia em 1 a cada novo CaixaDiario)

Reinicia quando um novo CaixaDiario é aberto

RN02 - Cálculo de Valor Total do Pedido
ValorTotal = Σ(quantidade × precoUnitario) de todos os ItensPedido

Atualizado automaticamente quando itens são adicionados/removidos/modificados

RN03 - Atualização Automática de Status do Pedido
Quando todos os ItemPedido estiverem com status PRONTO → Pedido atualiza para PRONTO

Quando algum ItemPedido está em PREPARANDO → Pedido fica PREPARANDO

RN04 - Integração Pedido-Comanda
Pedidos do tipo COMER_AQUI obrigatoriamente vinculados a uma Comanda

Comanda deve estar com status ABERTA para vincular novos pedidos

RN05 - Regras de Fechamento de Comanda
Comanda só pode ser fechada quando TODOS os pedidos vinculados estiverem:

StatusPagamento PAGO ou FIADO

Status ENTREGUE

RN06 - Regras do CaixaDiario
Apenas um CaixaDiario pode estar ABERTO por vez

CaixaDiario só pode ser fechado se não houver Comandas ABERTAS

RN07 - Regras para Itens Adicionais
Itens com categoria ADICIONAL só podem ser adicionados com um item principal

Impedir pedidos apenas com itens ADICIONAL

Relacionamentos
text
Produto 1 ──────── N ItemPedido N ──────── 1 Pedido
Pedido 1 ──────── 1 ComandaPedido N ──────── 1 Comanda
Pedido N ──────── 1 CaixaDiario (por data)
Tecnologias Utilizadas
Java 25

Spring Boot 3.2.0

Spring Data JPA

H2 Database (desenvolvimento)

Flyway (migrações)

Lombok

Maven

Estrutura de Pacotes
text
com.filacerta.fc/
├── enums/
│   ├── CategoriaProduto.java
│   ├── TipoPedido.java
│   ├── OrigemPedido.java
│   ├── StatusPedido.java
│   ├── StatusPagamento.java
│   ├── MetodoPagamento.java
│   ├── StatusItemPedido.java
│   ├── StatusComanda.java
│   └── StatusCaixa.java
├── entities/
│   ├── Produto.java
│   ├── Pedido.java
│   ├── ItemPedido.java
│   ├── Comanda.java
│   ├── ComandaPedido.java
│   └── CaixaDiario.java
├── repositories/
├── services/
└── controllers/
Commits Realizados
1. Configuração Inicial
Configuração do Spring Boot 3.2.0

Adição das dependências (JPA, H2, Flyway, Lombok, Web)

Configuração do application.properties

2. Migrações do Banco
Criação das tabelas (V1 a V8)

Inserção dos dados iniciais (29 produtos)

Configuração do Flyway para execução automática

3. Modelagem do Domínio
Criação dos enums (9 enums)

Criação das entidades JPA (6 entidades)

Mapeamento dos relacionamentos

Aplicação das regras de negócio

Documento revisado em: 20/07/2026
Versão: 1.0

text

## 📋 Comandos para commit:

```bash
# Verificar status
git status

# Adicionar todos os arquivos
git add .

# Commit com mensagem descritiva
git commit -m "feat: Modelagem do domínio e migrações iniciais

- Configuração Spring Boot 3.2.0
- Criação das migrações Flyway (V1 a V8)
- Criação dos enums (9 enums)
- Criação das entidades JPA (6 entidades)
- Inserção dos dados iniciais (29 produtos)
- Documentação da modelagem do domínio"

# Push para o repositório 
git push origin main


✅ Checklist Concluído:

☑ Entidades definidas
☑ Atributos tipados
☑ Relacionamentos mapeados
☑ Regras de negócio documentadas
☑ DER gerado
☑ Documento Markdown criado
☑ Revisão realizada
☑ Commit realizado