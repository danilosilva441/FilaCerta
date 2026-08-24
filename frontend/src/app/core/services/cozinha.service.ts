import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FilaCozinhaResponse } from '../models/cozinha.model';

@Injectable({
  providedIn: 'root',
})
export class CozinhaService {
  private apiUrl = '/api/cozinha';

  constructor(private http: HttpClient) {}

  listarFila(): Observable<FilaCozinhaResponse[]> {
    return this.http.get<FilaCozinhaResponse[]>(`${this.apiUrl}/fila`);
  }

  atualizarStatusItem(pedidoId: number, itemId: number, status: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/pedidos/${pedidoId}/itens/${itemId}`, { status });
  }
}
