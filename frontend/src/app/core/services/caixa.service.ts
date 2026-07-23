import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CaixaDiarioResponse {
  id: number;
  data: string;
  horaAbertura: string;
  horaFechamento?: string;
  valorInicial: number;
  status: 'ABERTO' | 'FECHADO';
  totalDinheiro: number;
  totalDebito: number;
  totalCredito: number;
  totalPix: number;
  totalFiado: number;
  totalPedidos: number;
  totalCancelados: number;
  valorTotal?: number;
}

@Injectable({ providedIn: 'root' })
export class CaixaService {

  private readonly apiUrl = `${environment.apiUrl}/caixa`;

  constructor(private http: HttpClient) {}

  /** POST /api/caixa/abrir */
  abrir(): Observable<any> {
    return this.http.post(`${this.apiUrl}/abrir`, {}).pipe(
      catchError(this.handleError)
    );
  }

  /** POST /api/caixa/fechar */
  fechar(): Observable<any> {
    return this.http.post(`${this.apiUrl}/fechar`, {}).pipe(
      catchError(this.handleError)
    );
  }

  /** GET /api/caixa/hoje */
  buscarCaixaHoje(): Observable<CaixaDiarioResponse | null> {
    return this.http.get<CaixaDiarioResponse>(`${this.apiUrl}/hoje`).pipe(
      catchError((error) => {
        // Se 404 = nenhum caixa hoje, retorna null
        if (error.status === 404) {
          return of(null);
        }
        // Se 500 ou outro erro, também retorna null para não quebrar o app
        console.warn('[CaixaService] Erro ao buscar caixa:', error.status);
        return of(null);
      })
    );
  }

  /** GET /api/caixa/{data} */
  buscarPorData(data: string): Observable<CaixaDiarioResponse> {
    return this.http.get<CaixaDiarioResponse>(`${this.apiUrl}/${data}`).pipe(
      catchError(this.handleError)
    );
  }

  /** Verifica se há caixa aberto hoje */
  verificarCaixaAberto(): Observable<boolean> {
    return this.buscarCaixaHoje().pipe(
      map(caixa => {
        if (!caixa) return false;
        return caixa.status === 'ABERTO';
      }),
      catchError(() => of(false))
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('[CaixaService] Erro:', error);
    const mensagem = error?.error?.message || error?.message || 'Falha na operação do caixa.';
    return throwError(() => new Error(mensagem));
  }
}
