import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLogado()) {
    return true; // Pode entrar!
  }

  // Se não tem login, chuta para a tela de login
  router.navigate(['/login']);
  return false;
};
