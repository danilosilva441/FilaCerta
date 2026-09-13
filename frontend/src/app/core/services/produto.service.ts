import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Produto } from '../models/produto.model';

@Injectable({
  providedIn: 'root',
})
export class ProdutoService {
  private apiUrl = '/api/produtos';

  constructor(private http: HttpClient) {}

  listar(categoriaId?: number): Observable<Produto[]> {
    // Força a trazer 100 itens para não precisar paginar no front agora
    let params = new HttpParams().set('size', '100');

    if (categoriaId) {
      params = params.set('categoriaId', categoriaId.toString());
    }

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      // A mágica que resolve o erro Symbol.iterator:
      map((response) => response.content),
    );
  }
}
