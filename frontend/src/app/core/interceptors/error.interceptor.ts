import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ErrorHandlerService } from '../services/error-handler.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private errorHandler: ErrorHandlerService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Log detalhado para debug
        if (error.status !== 200) {
          console.error(
            `[ErrorInterceptor] HTTP ${error.status}:`,
            error.error?.error || error.message,
            '|',
            error.error?.message || ''
          );
        }

        // Preserva o erro original e adiciona mensagem amigável
        const enhancedError = {
          ...error,
          originalError: error.error,        // ← Preserva o corpo original
          mensagemAmigavel: this.errorHandler.getMensagemAmigavel(error),
          titulo: this.errorHandler.getTitulo(error),
        };

        return throwError(() => enhancedError);
      })
    );
  }
}
