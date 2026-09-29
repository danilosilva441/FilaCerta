import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<string> {
    // O responseType: 'text' é porque o backend devolve o token puro, não um JSON
    return this.http
      .post(this.apiUrl + '/login', { username, password }, { responseType: 'text' })
      .pipe(tap((token) => this.salvarToken(token)));
  }

  salvarToken(token: string): void {
    localStorage.setItem('token', token);
  }

  obterToken(): string | null {
    return localStorage.getItem('token');
  }

  isLogado(): boolean {
    return !!this.obterToken(); // Se tem token, tá logado!
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  isDono(): boolean {
    return this.isLogado(); // No nosso sistema, se logou, é o dono!
  }

  refreshToken(): Observable<string> {
    return this.http
      .post(
        this.apiUrl + '/refresh', // Usando o proxy corretamente!
        {},
        {
          responseType: 'text',
          withCredentials: true,
        },
      )
      .pipe(
        tap((novoToken) => {
          this.salvarToken(novoToken);
        }),
      );
  }
}
