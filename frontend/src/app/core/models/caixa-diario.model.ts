export interface CaixaDiarioResponse {
  id: number;
  data: string;
  horaAbertura: string;
  horaFechamento: string;
  valorInicial: number;
  totalDinheiro: number;
  totalPedidos: number;
  status: 'ABERTO' | 'FECHADO';
}

export interface AbrirCaixaRequest {
  valorInicial: number;
}
