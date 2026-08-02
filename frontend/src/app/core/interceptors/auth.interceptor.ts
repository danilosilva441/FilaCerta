import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  // Endpoints que NÃO precisam de token
  private readonly publicEndpoints = [
    '/auth/usuario/login',
    '/auth/cliente/registrar',
    '/auth/cliente/login',
    '/produtos',
    '/produtos/disponiveis',
  ];

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Verifica se é um endpoint público
    const isPublic = this.publicEndpoints.some(endpoint => req.url.includes(endpoint));

    if (isPublic) {
      return next.handle(req);
    }

    // Adiciona token se disponível
    const token = this.authService.getToken();
    if (token) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(authReq);
    }

    return next.handle(req);
  }
}
