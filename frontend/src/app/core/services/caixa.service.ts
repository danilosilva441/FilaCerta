import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface StatusCaixaResponse {
  status: 'ABERTO' | 'PAUSADO' | 'FECHADO' | 'NAO_ABERTO';
  mensagem: string;
  mensagemDetalhada: string;
  icone: string;
  podePedir: boolean;
  horaPausa?: string;
  motivoPausa?: string;
  tempoEstimado?: string;
}

export interface CaixaDiarioResponse {
  id: number;
  data: string;
  horaAbertura: string;
  horaFechamento?: string;
  horaPausa?: string;
  horaReativacao?: string;
  motivoPausa?: string;
  tempoEstimadoRetorno?: string;
  valorInicial: number;
  status: 'ABERTO' | 'PAUSADO' | 'FECHADO';
  totalDinheiro: number;
  totalDebito: number;
  totalCredito: number;
  totalPix: number;
  totalFiado: number;
  totalPedidos: number;
  totalCancelados: number;
  createdAt?: string;
}

export interface PausarRequest {
  motivo: string;
  tempoEstimado: string;
}

@Injectable({ providedIn: 'root' })
export class CaixaService {

  private readonly apiUrl = `${environment.apiUrl}/caixa`;

  constructor(private http: HttpClient) {}

   // Verificar status do caixa (público)
  getStatus(): Observable<StatusCaixaResponse> {
    return this.http.get<StatusCaixaResponse>(`${this.apiUrl}/hoje/status`);
  }

  // Verificar se o caixa está aberto (método simplificado para o Guard)
  verificarCaixaAberto(): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this.getStatus().subscribe({
        next: (status) => {
          observer.next(status.status === 'ABERTO');
          observer.complete();
        },
        error: (error) => {
          console.error('Erro ao verificar caixa:', error);
          observer.next(false);
          observer.complete();
        }
      });
    });
  }


  /** POST /api/caixa/abrir */
  abrir(): Observable<any> {
    return this.http.post(`${this.apiUrl}/abrir`, {}).pipe(
      catchError(this.handleError)
    );
  }

  /** POST /api/caixa/pausar */
  pausar(motivo: string, tempoEstimado: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/pausar`, { motivo, tempoEstimado }).pipe(
      catchError(this.handleError)
    );
  }

  /** POST /api/caixa/reativar */
  reativar(): Observable<any> {
    return this.http.post(`${this.apiUrl}/reativar`, {}).pipe(
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
        if (error.status === 404) {
          console.log('[CaixaService] Nenhum caixa encontrado hoje.');
          return of(null);
        }
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

  /** Verifica se pode fazer pedidos */
  verificarPodePedir(): Observable<boolean> {
    return this.getStatus().pipe(
      map(status => status.podePedir),
      catchError(() => of(false))
    );
  }

  private handleError(error: any): Observable<never> {
    if (error.status !== 404) {
      console.error('[CaixaService] Erro:', error);
    }
    const mensagem = error?.mensagemAmigavel || error?.error?.message || error?.message || 'Falha na operação do caixa.';
    return throwError(() => new Error(mensagem));
  }
}
