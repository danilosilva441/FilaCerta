import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import {
  CriarPedidoRequest,
  PedidoResponse,
  AtualizarItemRequest,
  RegistrarPagamentoRequest,
  FilaCozinhaResponse,
  StatusPedido,
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PedidoService {

  private readonly apiUrl = `${environment.apiUrl}/pedidos`;

  constructor(private http: HttpClient) {}

  // ──── CRUD Principal ────

  /** POST /api/pedidos */
  criar(request: CriarPedidoRequest): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(this.apiUrl, request).pipe(
      catchError(this.handleError)
    );
  }

  /** GET /api/pedidos/{id} */
  buscarPorId(id: number): Observable<PedidoResponse> {
    return this.http.get<PedidoResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /** GET /api/pedidos?status=RECEBIDO */
  listarPorStatus(status?: StatusPedido): Observable<PedidoResponse[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<PedidoResponse[]>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  // ──── Status do Pedido ────

  /** PATCH /api/pedidos/{id}/status?status=PRONTO */
  atualizarStatus(id: number, status: StatusPedido): Observable<PedidoResponse> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<PedidoResponse>(`${this.apiUrl}/${id}/status`, null, { params }).pipe(
      catchError(this.handleError)
    );
  }

  // ──── Itens do Pedido ────

  /** PATCH /api/pedidos/{pedidoId}/itens/{itemId} */
  atualizarItem(pedidoId: number, itemId: number, request: AtualizarItemRequest): Observable<PedidoResponse> {
    return this.http.patch<PedidoResponse>(
      `${this.apiUrl}/${pedidoId}/itens/${itemId}`,
      request
    ).pipe(catchError(this.handleError));
  }

  /** DELETE /api/pedidos/{pedidoId}/itens/{itemId} */
  removerItem(pedidoId: number, itemId: number): Observable<PedidoResponse> {
    return this.http.delete<PedidoResponse>(
      `${this.apiUrl}/${pedidoId}/itens/${itemId}`
    ).pipe(catchError(this.handleError));
  }

  // ──── Pagamento ────

  /** POST /api/pedidos/{id}/pagamento */
  registrarPagamento(id: number, request: RegistrarPagamentoRequest): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(
      `${this.apiUrl}/${id}/pagamento`,
      request
    ).pipe(catchError(this.handleError));
  }

  // ──── Cancelamento ────

  /** POST /api/pedidos/{id}/cancelar */
  cancelar(id: number): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(
      `${this.apiUrl}/${id}/cancelar`,
      {}
    ).pipe(catchError(this.handleError));
  }

  // ──── Fila Cozinha ────

  /** GET /api/pedidos/fila/cozinha */
  buscarFilaCozinha(): Observable<FilaCozinhaResponse> {
    return this.http.get<FilaCozinhaResponse>(`${this.apiUrl}/fila/cozinha`).pipe(
      catchError(this.handleError)
    );
  }

  // ──── Tratamento de Erro ────

  private handleError(error: any): Observable<never> {
    console.error('[PedidoService] Erro:', error);
    const mensagem = error?.error?.message || 'Falha ao processar pedido.';
    return throwError(() => new Error(mensagem));
  }
}
