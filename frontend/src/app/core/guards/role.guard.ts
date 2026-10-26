import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const userRole = authService.getRoleFromToken();

    // Se o usuário tem uma role e ela está na lista de permitidas
    if (userRole && allowedRoles.includes(userRole.toUpperCase())) {
      return true;
    }

    // Se não tiver permissão, chuta de volta para o PDV/Caixa ou Login
    console.warn('Bloqueado pelo RoleGuard! Permissão insuficiente.');
    router.navigate(['/pdv']); // Ajuste para a rota principal do Seu Mikael
    return false;
  };
};
