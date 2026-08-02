import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, retry, catchError, throwError } from 'rxjs';
import { FilaCozinhaResponse, PedidoResponse, StatusPedido, StatusItemPedido } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CozinhaService {

  private readonly apiUrl = `${environment.apiUrl}/cozinha`;

  constructor(private http: HttpClient) {}

  /** GET /api/cozinha/fila */
  listarFila(): Observable<FilaCozinhaResponse> {
    return this.http.get<FilaCozinhaResponse>(`${this.apiUrl}/fila`).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  /** PATCH /api/cozinha/pedidos/{id}/iniciar */
  iniciarPreparo(id: number): Observable<PedidoResponse> {
    return this.http.patch<PedidoResponse>(`${this.apiUrl}/pedidos/${id}/iniciar`, {}).pipe(
      catchError(this.handleError)
    );
  }

  /** PATCH /api/cozinha/pedidos/{id}/pronto */
  marcarPronto(id: number): Observable<PedidoResponse> {
    return this.http.patch<PedidoResponse>(`${this.apiUrl}/pedidos/${id}/pronto`, {}).pipe(
      catchError(this.handleError)
    );
  }

  /** PATCH /api/cozinha/pedidos/{id}/entregar */
  entregarPedido(id: number): Observable<PedidoResponse> {
    return this.http.patch<PedidoResponse>(`${this.apiUrl}/pedidos/${id}/entregar`, {}).pipe(
      catchError(this.handleError)
    );
  }

  /** PATCH /api/cozinha/pedidos/{pedidoId}/itens/{itemId}/status */
  atualizarStatusItem(pedidoId: number, itemId: number, status: StatusItemPedido): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/pedidos/${pedidoId}/itens/${itemId}/status`,
      { status }
    ).pipe(catchError(this.handleError));
  }

  /** GET /api/cozinha/pedidos/status/{status} */
  listarPorStatus(status: StatusPedido): Observable<PedidoResponse[]> {
    return this.http.get<PedidoResponse[]>(`${this.apiUrl}/pedidos/status/${status}`).pipe(
      catchError(this.handleError)
    );
  }

  /** GET /api/cozinha/pedidos/em-andamento */
  listarEmAndamento(): Observable<PedidoResponse[]> {
    return this.http.get<PedidoResponse[]>(`${this.apiUrl}/pedidos/em-andamento`).pipe(
      catchError(this.handleError)
    );
  }

  /** GET /api/cozinha/pedidos/aguardando */
  listarAguardando(): Observable<PedidoResponse[]> {
    return this.http.get<PedidoResponse[]>(`${this.apiUrl}/pedidos/aguardando`).pipe(
      catchError(this.handleError)
    );
  }

  /** GET /api/cozinha/pedidos/prontos */
  listarProntos(): Observable<PedidoResponse[]> {
    return this.http.get<PedidoResponse[]>(`${this.apiUrl}/pedidos/prontos`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('[CozinhaService] Erro:', error);
    const mensagem = error?.error?.message || 'Falha ao carregar cozinha.';
    return throwError(() => new Error(mensagem));
  }
}
