import { CategoriaProduto } from './produto.model';

// ──────────────────────────────────────────────
// Enums (espelham os enums do backend)
// ──────────────────────────────────────────────

export type TipoPedido = 'LEVAR' | 'COMER_AQUI';

export type OrigemPedido = 'QR_CODE' | 'MANUAL';

export type StatusPedido =
  | 'RECEBIDO'
  | 'PREPARANDO'
  | 'PRONTO'
  | 'ENTREGUE'
  | 'CANCELADO';

export type StatusPagamento = 'AGUARDANDO' | 'PAGO' | 'FIADO';

export type MetodoPagamento =
  | 'DINHEIRO'
  | 'CARTAO_DEBITO'
  | 'CARTAO_CREDITO'
  | 'PIX'
  | 'FIADO';

export type StatusItemPedido = 'PENDENTE' | 'PREPARANDO' | 'PRONTO';

// ──────────────────────────────────────────────
// Requests (envio para API)
// ──────────────────────────────────────────────

export interface CriarPedidoRequest {
  nomeCliente: string;
  tipo: TipoPedido;
  origem: OrigemPedido;
  itens: ItemPedidoRequest[];
  observacao?: string;
}

export interface ItemPedidoRequest {
  produtoId: number;
  quantidade: number;
  observacao?: string;
}

export interface AtualizarItemRequest {
  quantidade?: number;
  observacao?: string;
}

export interface RegistrarPagamentoRequest {
  metodoPagamento: MetodoPagamento;
}

export interface CriarComandaRequest {
  nomeCliente: string;
  mesa?: number;
}

// ──────────────────────────────────────────────
// Responses (recebidos da API)
// ──────────────────────────────────────────────

export interface PedidoResponse {
  id: number;
  numero: number;
  nomeCliente: string;
  tipo: TipoPedido;
  origem: OrigemPedido;
  status: StatusPedido;
  statusPagamento: StatusPagamento;
  metodoPagamento?: MetodoPagamento;
  valorTotal: number;
  dataHoraPedido: string;       // LocalDateTime → ISO string
  dataHoraPronto?: string;
  dataHoraEntrega?: string;
  dataHoraPagamento?: string;
  observacao?: string;
  itens: ItemPedidoResponse[];
  comanda?: ComandaResponse;
}

export interface ItemPedidoResponse {
  id: number;
  produtoId: number;
  nomeProduto: string;
  descricaoProduto: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  status: StatusItemPedido;
  observacaoItem?: string;
}
// ──────────────────────────────────────────────
// Fila da Cozinha (resposta especial)
// ──────────────────────────────────────────────

export interface FilaCozinhaResponse {
  totalPedidos: number;
  pedidos: PedidoResumidoResponse[];
}

export interface PedidoResumidoResponse {
  id: number;
  numero: number;
  nomeCliente: string;
  dataHoraPedido: string;
  tempoEsperaMinutos: number;
  status: StatusPedido;
  observacao?: string;              // ← ADICIONAR
  statusPagamento?: StatusPagamento; // ← ADICIONAR
  metodoPagamento?: MetodoPagamento; // ← ADICIONAR
  itens: ItemResumidoResponse[];
}

export interface ItemResumidoResponse {
  id: number;
  nomeProduto: string;
  quantidade: number;
  status: string;
  observacaoItem?: string;          // ← ADICIONAR
}

// ──────────────────────────────────────────────
// Comanda
// ──────────────────────────────────────────────

export interface ComandaResponse {
  id: number;
  codigo: string;
  nomeCliente: string;
  mesa?: number;
  status: 'ABERTA' | 'FECHADA';
  valorTotal: number;
  abertura: string;
  fechamento?: string;
  pedidos: PedidoResponse[];
}

// ──────────────────────────────────────────────
// Erro da API
// ──────────────────────────────────────────────

export interface ErrorResponse {
  status: number;
  error: string;
  message: string;
  timestamp: string;
  path?: string;
  details?: string;
}
