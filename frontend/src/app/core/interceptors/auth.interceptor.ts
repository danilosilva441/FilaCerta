import { inject } from '@angular/core';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service'; // Ajuste o caminho

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export function authInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);
  const token = authService.obterToken(); // Adapte para o método que lê o seu token atual

  // Se for a rota de login ou refresh, não tentamos intercetar erros 401
  if (req.url.includes('/api/auth/')) {
    // Mas garantimos que a rota de refresh leva os cookies
    if (req.url.includes('/refresh')) {
      req = req.clone({ withCredentials: true });
    }
    return next(req);
  }

  // Injeta o token atual no cabeçalho
  let authReq = req;
  if (token) {
    authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  // Envia a requisição e escuta possíveis erros
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // A MÁGICA AQUI: Aceitamos tanto 401 quanto 403 como sinal de token vencido
      if ((error.status === 401 || error.status === 403) && token) {
        return handle401Error(authReq, next, authService);
      }
      return throwError(() => error);
    }),
  );

  function handle401Error(req: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshTokenSubject.next(null);

      return authService.refreshToken().pipe(
        switchMap((novoToken: string) => {
          isRefreshing = false;
          refreshTokenSubject.next(novoToken);

          // Repete a requisição original que tinha falhado, agora com o token novo
          return next(req.clone({ setHeaders: { Authorization: `Bearer ${novoToken}` } }));
        }),
        catchError((err) => {
          isRefreshing = false;
          // Se o refresh falhar (ex: passaram os 7 dias), expulsa o utilizador
          authService.logout();
          return throwError(() => err);
        }),
      );
    } else {
      // Se já houver um refresh em andamento, as outras requisições esperam aqui
      return refreshTokenSubject.pipe(
        filter((token) => token != null),
        take(1),
        switchMap((token) => {
          return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
        }),
      );
    }
  }
}
