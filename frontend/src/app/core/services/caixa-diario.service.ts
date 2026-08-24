import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CaixaDiarioResponse, AbrirCaixaRequest } from '../models/caixa-diario.model';

@Injectable({
  providedIn: 'root',
})
export class CaixaDiarioService {
  private apiUrl = '/api/caixa-diario';

  constructor(private http: HttpClient) {}

  buscarCaixaAtual(): Observable<CaixaDiarioResponse | null> {
    return this.http.get<CaixaDiarioResponse | null>(`${this.apiUrl}/atual`);
  }

  abrirCaixa(request: AbrirCaixaRequest): Observable<CaixaDiarioResponse> {
    return this.http.post<CaixaDiarioResponse>(`${this.apiUrl}/abrir`, request);
  }

  fecharCaixa(): Observable<CaixaDiarioResponse> {
    return this.http.post<CaixaDiarioResponse>(`${this.apiUrl}/fechar`, {});
  }
}
