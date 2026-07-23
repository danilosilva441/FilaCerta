import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ComandaResponse, CriarComandaRequest } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ComandaService {

  private readonly apiUrl = `${environment.apiUrl}/comandas`;

  constructor(private http: HttpClient) {}

  // ──── CRUD ────

  /** POST /api/comandas */
  criar(request: CriarComandaRequest): Observable<ComandaResponse> {
    return this.http.post<ComandaResponse>(this.apiUrl, request).pipe(
      catchError(this.handleError)
    );
  }

  /** GET /api/comandas/{id} */
  buscarPorId(id: number): Observable<ComandaResponse> {
    return this.http.get<ComandaResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /** GET /api/comandas/codigo/{codigo} */
  buscarPorCodigo(codigo: string): Observable<ComandaResponse> {
    return this.http.get<ComandaResponse>(`${this.apiUrl}/codigo/${codigo}`).pipe(
      catchError(this.handleError)
    );
  }

  /** GET /api/comandas/abertas */
  listarAbertas(): Observable<ComandaResponse[]> {
    return this.http.get<ComandaResponse[]>(`${this.apiUrl}/abertas`).pipe(
      catchError(this.handleError)
    );
  }

  // ──── Ações ────

  /** POST /api/comandas/{id}/fechar */
  fechar(id: number): Observable<ComandaResponse> {
    return this.http.post<ComandaResponse>(`${this.apiUrl}/${id}/fechar`, {}).pipe(
      catchError(this.handleError)
    );
  }

  /** POST /api/comandas/{comandaId}/pedidos/{pedidoId} */
  adicionarPedido(comandaId: number, pedidoId: number): Observable<ComandaResponse> {
    return this.http.post<ComandaResponse>(
      `${this.apiUrl}/${comandaId}/pedidos/${pedidoId}`,
      {}
    ).pipe(catchError(this.handleError));
  }

  // ──── Tratamento de Erro ────

  private handleError(error: any): Observable<never> {
    console.error('[ComandaService] Erro:', error);
    const mensagem = error?.error?.message || 'Falha na operação da comanda.';
    return throwError(() => new Error(mensagem));
  }
}
