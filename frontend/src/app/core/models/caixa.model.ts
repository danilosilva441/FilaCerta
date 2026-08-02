export interface CaixaDiarioResponse {
  id: number;
  data: string;
  horaAbertura: string;
  horaFechamento?: string;
  horaPausa?: string;                // ← ADICIONAR
  horaReativacao?: string;           // ← ADICIONAR
  motivoPausa?: string;              // ← ADICIONAR
  tempoEstimadoRetorno?: string;     // ← ADICIONAR
  valorInicial: number;
  status: 'ABERTO' | 'PAUSADO' | 'FECHADO'; // ← ADICIONAR PAUSADO
  totalDinheiro: number;
  totalDebito: number;
  totalCredito: number;
  totalPix: number;
  totalFiado: number;
  totalPedidos: number;
  totalCancelados: number;
  totalConcluidos?: number;          // ← ADICIONAR
  valorTotalConcluidos?: number;     // ← ADICIONAR
}

export interface StatusCaixaResponse {
  status: 'ABERTO' | 'PAUSADO' | 'FECHADO' | 'NAO_ABERTO';
  mensagem: string;
  mensagemDetalhada: string;
  icone: string;
  podePedir: boolean;
  horaPausa?: string;
  motivoPausa?: string;
  tempoEstimado?: string;
}

export interface AbrirCaixaRequest {
  valorInicial: number;
}
