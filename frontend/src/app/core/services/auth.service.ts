import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}

  // Simula se o usuário está logado como dono
  isDono(): boolean {
    // Por enquanto, vamos fingir que se tem qualquer coisa no localStorage chamada 'dono_token', ele é o dono.
    // Depois, na Fase 3, colocaremos o JWT de verdade aqui.
    return !!localStorage.getItem('dono_token');
  }

  // Função provisória para você testar (chame ela no console do navegador para virar dono)
  loginMock(): void {
    localStorage.setItem('dono_token', 'sou_o_chefe');
    window.location.reload();
  }

  logoutMock(): void {
    localStorage.removeItem('dono_token');
    window.location.reload();
  }
}
