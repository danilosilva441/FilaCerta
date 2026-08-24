import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PedidoResponse } from '../models/pedido.model';

@Injectable({
  providedIn: 'root',
})
export class CaixaService {
  private apiUrl = '/api/caixa';

  constructor(private http: HttpClient) {}

  listarPagamentosPendentes(): Observable<PedidoResponse[]> {
    return this.http.get<PedidoResponse[]>(`${this.apiUrl}/pagamentos-pendentes`);
  }

  atualizarPagamento(pedidoId: number, statusPagamento: 'AGUARDANDO' | 'PAGO'): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/pedidos/${pedidoId}/pagamento`, {
      statusPagamento,
    });
  }
}
