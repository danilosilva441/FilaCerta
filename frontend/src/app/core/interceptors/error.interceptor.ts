import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let mensagem = 'Ocorreu um erro inesperado.';

        if (error.status === 0) {
          mensagem = 'Sem conexão com o servidor.';
        } else if (error.status === 400) {
          mensagem = error.error?.message || 'Dados inválidos.';
        } else if (error.status === 404) {
          mensagem = error.error?.message || 'Recurso não encontrado.';
        } else if (error.status === 422) {
          mensagem = error.error?.message || 'Operação não permitida.';
        } else if (error.status >= 500) {
          mensagem = 'Erro interno do servidor.';
        }

        // Só loga erros reais
        if (error.status !== 200 && error.status !== 0) {
          console.error(`[ErrorInterceptor] HTTP ${error.status}:`, error.message);
        }

        return throwError(() => new Error(mensagem));
      })
    );
  }
}
