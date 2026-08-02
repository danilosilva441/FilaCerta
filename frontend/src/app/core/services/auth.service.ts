import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError, of } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export type TipoUsuario = 'DONO' | 'FUNCIONARIO' | 'CLIENTE';

export interface AuthResponse {
  success: boolean;
  token?: string;
  tipo?: TipoUsuario;
  codigoCliente?: string;
  nomeCliente?: string;
  message: string;
}

export interface UserSession {
  tipo: TipoUsuario;
  token?: string;
  codigoCliente?: string;
  nomeCliente?: string;
  nome?: string;
}

export interface UserSession {
  tipo: TipoUsuario;
  token?: string;
  codigoCliente?: string;
  nomeCliente?: string;
  nome?: string;
  pedidoAtivoId?: number;  // ← NOVO
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // Estado reativo
  readonly usuario = signal<UserSession | null>(null);
  readonly isAuthenticated = signal(false);
  readonly isDono = signal(false);
  readonly isCliente = signal(false);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.carregarSessao();
  }

  // ──── DONO / FUNCIONÁRIO ────

  /** POST /auth/usuario/login */
  loginDono(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/usuario/login`, {
      username,
      password
    }).pipe(
      tap(res => this.salvarSessao({
        tipo: res.tipo || 'DONO',
        token: res.token,
        nomeCliente: res.nomeCliente,
      })),
      catchError(this.handleError)
    );
  }

  // ──── CLIENTE ────

  /** POST /auth/cliente/registrar */
  registrarCliente(nome: string, sobrenome: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/cliente/registrar`, {
      nome,
      sobrenome
    }).pipe(
      tap(res => this.salvarSessao({
        tipo: 'CLIENTE',
        token: res.token,
        codigoCliente: res.codigoCliente,
        nomeCliente: res.nomeCliente,
        nome: `${nome} ${sobrenome}`,
      })),
      catchError(this.handleError)
    );
  }

  /** POST /auth/cliente/login?codigo=CLI-0001 */
  loginCliente(codigo: string): Observable<AuthResponse> {
    const params = new HttpParams().set('codigo', codigo);
    return this.http.post<AuthResponse>(`${this.apiUrl}/cliente/login`, null, { params }).pipe(
      tap(res => this.salvarSessao({
        tipo: 'CLIENTE',
        token: res.token,
        codigoCliente: res.codigoCliente || codigo,
        nomeCliente: res.nomeCliente,
      })),
      catchError(this.handleError)
    );
  }

  /** GET /auth/cliente/validar */
  validarSessao(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.apiUrl}/cliente/validar`).pipe(
      catchError(() => {
        this.logout();
        return of({ success: false, message: 'Sessão expirada' });
      })
    );
  }

  /** POST /auth/cliente/logout */
  logoutCliente(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/cliente/logout`, {}).pipe(
      tap(() => this.logout()),
      catchError(() => {
        this.logout();
        return of({ success: true, message: 'Logout local' });
      })
    );
  }

  // ──── SESSÃO ────

  private salvarSessao(session: UserSession): void {
    this.usuario.set(session);
    this.isAuthenticated.set(true);
    this.isDono.set(session.tipo === 'DONO' || session.tipo === 'FUNCIONARIO');
    this.isCliente.set(session.tipo === 'CLIENTE');
    localStorage.setItem('filacerta_user', JSON.stringify(session));
  }

  private carregarSessao(): void {
    const saved = localStorage.getItem('filacerta_user');
    if (saved) {
      try {
        const session: UserSession = JSON.parse(saved);
        this.usuario.set(session);
        this.isAuthenticated.set(true);
        this.isDono.set(session.tipo === 'DONO' || session.tipo === 'FUNCIONARIO');
        this.isCliente.set(session.tipo === 'CLIENTE');
      } catch {
        localStorage.removeItem('filacerta_user');
      }
    }
  }

  logout(): void {
    this.usuario.set(null);
    this.isAuthenticated.set(false);
    this.isDono.set(false);
    this.isCliente.set(false);
    localStorage.removeItem('filacerta_user');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.usuario()?.token || null;
  }

  private handleError(error: any): Observable<never> {
    console.error('[AuthService] Erro:', error);
    const mensagem = error?.error?.message || 'Falha na autenticação.';
    return throwError(() => new Error(mensagem));
  }
  /** Salvar ID do pedido ativo */
  setPedidoAtivo(pedidoId: number): void {
    const session = this.usuario();
    if (session) {
      session.pedidoAtivoId = pedidoId;
      this.usuario.set(session);
      localStorage.setItem('filacerta_user', JSON.stringify(session));
    }
  }

  /** Limpar pedido ativo (quando finalizado/cancelado) */
  limparPedidoAtivo(): void {
    const session = this.usuario();
    if (session) {
      delete session.pedidoAtivoId;
      this.usuario.set(session);
      localStorage.setItem('filacerta_user', JSON.stringify(session));
    }
  }

  /** Obter ID do pedido ativo */
  getPedidoAtivoId(): number | null {
    return this.usuario()?.pedidoAtivoId || null;
  }

}
