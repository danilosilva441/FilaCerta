export interface ItemPedidoRequest {
  produtoId: number;
  quantidade: number;
  observacaoItem?: string;
}

export interface CriarPedidoRequest {
  nomeCliente: string;
  tipo: 'LEVAR' | 'COMER_AQUI';
  origem: 'QR_CODE' | 'MANUAL';
  itens: ItemPedidoRequest[];
  observacao?: string;
}

export interface ItemPedidoResponse {
  id: number;
  produtoId: number;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
  status: 'PENDENTE' | 'PREPARANDO' | 'PRONTO';
  observacaoItem?: string;
}

export interface PedidoResponse {
  id: number;
  numero: number;
  nomeCliente: string;
  tipo: 'LEVAR' | 'COMER_AQUI';
  status: 'RECEBIDO' | 'PREPARANDO' | 'PRONTO' | 'ENTREGUE' | 'CANCELADO';
  statusPagamento: 'AGUARDANDO' | 'PAGO';
  valorTotal: number;
  dataHoraPedido: string;
  itens: ItemPedidoResponse[];
}
