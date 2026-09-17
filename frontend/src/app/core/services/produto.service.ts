import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Produto } from '../models/produto.model';

@Injectable({
  providedIn: 'root',
})
export class ProdutoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/produtos`;

  // === ROTA DE LISTAGEM CORRIGIDA === //
  listar(categoriaId?: number): Observable<Produto[]> {
    const params = categoriaId ? `?categoriaId=${categoriaId}` : '';
    return this.http.get<Produto[]>(`${this.apiUrl}${params}`);
  }

  // === ROTAS DO PAINEL ADMINISTRATIVO === //
  criar(produto: any): Observable<Produto> {
    return this.http.post<Produto>(this.apiUrl, produto);
  }

  atualizar(id: number, produto: any): Observable<Produto> {
    return this.http.put<Produto>(`${this.apiUrl}/${id}`, produto);
  }

  inativar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
