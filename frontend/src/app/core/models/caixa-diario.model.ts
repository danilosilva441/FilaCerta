export interface CaixaDiarioResponse {
  id: number;
  data: string;
  horaAbertura: string;
  horaFechamento: string;
  valorInicial: number;
  totalDinheiro: number;
  totalPedidos: number;
  status: 'ABERTO' | 'FECHADO';
  cozinhaPausada?: Boolean;
}

export interface AbrirCaixaRequest {
  valorInicial: number;
}

export interface ResumoFechamentoResponse {
  caixaId: number;
  dataFechamento: string;
  valorInicialTroco: number;
  totalPix: number;
  totalCartao: number;
  totalDinheiro: number;
  faturamentoTotal: number;
  totalEmGaveta: number;
  quantidadeCancelados?: number;
  valorCancelados?: number;
}
