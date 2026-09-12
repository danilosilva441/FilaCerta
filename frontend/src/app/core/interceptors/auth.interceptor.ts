import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.obterToken();

  // Se tiver a chave (token), anexa no cabeçalho da requisição
  if (token) {
    const requisicaoClonada = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(requisicaoClonada); // Manda pro Spring Boot com o crachá!
  }

  // Se não tiver token (ex: cliente vendo cardápio), segue normal
  return next(req);
};
