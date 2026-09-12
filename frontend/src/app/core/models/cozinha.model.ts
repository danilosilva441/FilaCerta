export interface ItemCozinhaResponse {
  itemId: number;
  nomeProduto: string;
  quantidade: number;
  categoria: string;
  status: 'PENDENTE' | 'PREPARANDO' | 'PRONTO';
  observacaoItem?: string;
}

export interface FilaCozinhaResponse {
  id: number;
  pedidoId: number;
  numero: number;
  nomeCliente: string;
  itens: ItemCozinhaResponse[];
  status: string;
  dataHoraPedido: string;
  tempoEspera: string;
}
