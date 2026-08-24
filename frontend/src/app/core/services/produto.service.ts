import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produto } from '../models/produto.model';

@Injectable({
  providedIn: 'root',
})
export class ProdutoService {
  private apiUrl = '/api/produtos';

  constructor(private http: HttpClient) {}

  listar(categoria?: string): Observable<Produto[]> {
    let url = this.apiUrl;
    // Se tiver uma categoria e não for TODOS, adiciona na URL
    if (categoria && categoria !== 'TODOS') {
      url += `?categoria=${categoria}`;
    }
    return this.http.get<Produto[]>(url);
  }
}
