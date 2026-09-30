import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CriarPedidoRequest, PedidoResponse } from '../models/pedido.model';

@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  private apiUrl = '/api/pedidos';

  constructor(private http: HttpClient) {}

  criarPedido(request: CriarPedidoRequest): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(this.apiUrl, request);
  }

  // Em vez de buscarPorId, mude para:
  acompanharPedido(codigo: string): Observable<PedidoResponse> {
    return this.http.get<PedidoResponse>(`${this.apiUrl}/rastreio/${codigo}`);
  }

  // Adicione este método junto com os outros (criarPedido, buscarPorId, etc)
  cancelarPedido(pedidoId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${pedidoId}/cancelar`, {});
  }
}
