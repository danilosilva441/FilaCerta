import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// Ajuste o caminho do environment de acordo com o seu projeto
import { environment } from '../../../environments/environment';
import { AlterarSenhaRequest } from '../models/usuario.modal';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly http = inject(HttpClient);
  // Assumindo que a sua API base está no environment
  private readonly apiUrl = `${environment.apiUrl}/usuarios`;

  alterarSenha(request: AlterarSenhaRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/senha`, request);
  }
}
