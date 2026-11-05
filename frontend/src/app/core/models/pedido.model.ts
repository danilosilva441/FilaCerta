export interface ItemPedidoRequest {
  produtoId: number;
  quantidade: number;
  observacaoItem?: string;
}

export interface CriarPedidoRequest {
  nomeCliente: string;
  tipo: 'LEVAR' | 'COMER_AQUI';
  origem: 'QR_CODE' | 'MANUAL';
  formaPagamento: 'PIX' | 'CARTAO' | 'DINHEIRO' | 'NAO_INFORMADO';
  itens: ItemPedidoRequest[];
  statusPagamento: string;
}

export interface ItemPedidoResponse {
  id: number;
  produtoId: number;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
  status: 'PENDENTE' | 'PREPARANDO' | 'PRONTO' | 'CANCELADO' | 'ENTREGUE';
  observacaoItem?: string;
}

export interface PedidoResponse {
  id: number;
  numero: number;
  nomeCliente: string;
  tipo: 'COMER_AQUI' | 'LEVAR' | string;
  status: string;
  statusPagamento: 'AGUARDANDO' | 'PAGO' | string;
  formaPagamento?: 'PIX' | 'CARTAO' | 'DINHEIRO' | 'NAO_INFORMADO' | string;
  metodoPagamento?: 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'DINHEIRO' | string;
  valorTotal: number;
  dataHoraPedido: string;
  codigoAcompanhamento: string;
  itens: ItemPedidoResponse[];
}

export interface AtualizarPedidoRequest {
  itens: ItemPedidoRequest[];
}
