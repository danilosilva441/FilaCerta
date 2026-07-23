import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, retry, catchError, throwError } from 'rxjs';
import { ProdutoResponse, CategoriaProduto } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProdutoService {

  private readonly apiUrl = `${environment.apiUrl}/produtos`;

  constructor(private http: HttpClient) {}

  /** GET /api/produtos */
  listarTodos(): Observable<ProdutoResponse[]> {
    return this.http.get<ProdutoResponse[]>(this.apiUrl).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  /** GET /api/produtos/disponiveis */
  listarDisponiveis(): Observable<ProdutoResponse[]> {
    return this.http.get<ProdutoResponse[]>(`${this.apiUrl}/disponiveis`).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  /** GET /api/produtos/categoria/{categoria} */
  listarPorCategoria(categoria: CategoriaProduto): Observable<ProdutoResponse[]> {
    return this.http.get<ProdutoResponse[]>(`${this.apiUrl}/categoria/${categoria}`).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  /** GET /api/produtos/{id} */
  buscarPorId(id: number): Observable<ProdutoResponse> {
    return this.http.get<ProdutoResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('[ProdutoService] Erro:', error);
    const mensagem = error?.error?.message || 'Falha ao carregar produtos.';
    return throwError(() => new Error(mensagem));
  }
}
