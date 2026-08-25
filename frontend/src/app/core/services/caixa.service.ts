import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PedidoResponse } from '../models/pedido.model';
import {
  CaixaDiarioResponse,
  AbrirCaixaRequest,
  ResumoFechamentoResponse,
} from '../models/caixa-diario.model';

@Injectable({
  providedIn: 'root',
})
export class CaixaService {
  // Use the unified endpoint from the backend
  private apiUrl = '/api/caixa';

  constructor(private http: HttpClient) {}

  // ==========================================
  // OPERAÇÕES DO CAIXA DIÁRIO (Abertura/Fechamento/Dashboard)
  // ==========================================

  buscarCaixaAtual(): Observable<CaixaDiarioResponse | null> {
    return this.http.get<CaixaDiarioResponse | null>(`${this.apiUrl}/atual`);
  }

  abrirCaixa(request: AbrirCaixaRequest): Observable<CaixaDiarioResponse> {
    return this.http.post<CaixaDiarioResponse>(`${this.apiUrl}/abrir`, request);
  }

  fecharCaixa(id: number): Observable<ResumoFechamentoResponse> {
    return this.http.post<ResumoFechamentoResponse>(`${this.apiUrl}/${id}/fechar`, {});
  }

  obterResumoAtual(id: number): Observable<ResumoFechamentoResponse> {
    return this.http.get<ResumoFechamentoResponse>(`${this.apiUrl}/${id}/resumo-atual`);
  }

  // ==========================================
  // OPERAÇÕES DE PEDIDOS E PAGAMENTOS NO BALCÃO
  // ==========================================

  listarPagamentosPendentes(): Observable<PedidoResponse[]> {
    return this.http.get<PedidoResponse[]>(`${this.apiUrl}/pagamentos-pendentes`);
  }

  atualizarPagamento(pedidoId: number, statusPagamento: 'AGUARDANDO' | 'PAGO'): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/pedidos/${pedidoId}/pagamento`, {
      statusPagamento,
    });
  }

  finalizarEntrega(pedidoId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/pedidos/${pedidoId}/entregar`, {});
  }
}
