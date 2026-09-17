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
  tipo: 'LEVAR' | 'COMER_AQUI';
  status: string;
  statusPagamento: string;
  formaPagamento: 'PIX' | 'CARTAO' | 'DINHEIRO' | 'NAO_INFORMADO'; // <-- NOVO
  valorTotal: number;
  dataHoraPedido: string;
  itens: ItemPedidoResponse[];
}
