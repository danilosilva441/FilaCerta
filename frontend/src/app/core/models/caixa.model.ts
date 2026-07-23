export interface CaixaDiarioResponse {
  id: number;
  data: string;
  horaAbertura: string;
  horaFechamento?: string;
  valorInicial: number;
  status: 'ABERTO' | 'FECHADO';
  totalDinheiro: number;
  totalDebito: number;
  totalCredito: number;
  totalPix: number;
  totalFiado: number;
  totalPedidos: number;
  totalCancelados: number;
}

export interface AbrirCaixaRequest {
  valorInicial: number;
}
