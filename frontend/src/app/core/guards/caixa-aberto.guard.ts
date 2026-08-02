import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map, catchError, of } from 'rxjs';
import { CaixaService } from '../services/caixa.service';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CaixaAbertoGuard implements CanActivate {

  constructor(
    private caixaService: CaixaService,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.caixaService.getStatus().pipe(
      map(status => {
        if (status.status === 'ABERTO' && status.podePedir) {
          return true;
        }

        if (this.authService.isDono()) {
          this.redirecionarDono(status.status);
        } else {
          this.redirecionarCliente(status.status);
        }
        return false;
      }),
      catchError(() => {
        if (this.authService.isDono()) {
          this.router.navigate(['/dono/caixa/abertura']);
        } else {
          this.router.navigate(['/caixa/fechado']);
        }
        return of(false);
      })
    );
  }

  private redirecionarDono(status: string): void {
    switch (status) {
      case 'NAO_ABERTO':
        this.router.navigate(['/dono/caixa/abertura']);
        break;
      case 'PAUSADO':
        this.router.navigate(['/dono/caixa/reativar']);
        break;
      case 'FECHADO':
        this.router.navigate(['/dono/caixa/fechamento']);
        break;
      default:
        this.router.navigate(['/dono/caixa/abertura']);
    }
  }

  private redirecionarCliente(status: string): void {
    switch (status) {
      case 'NAO_ABERTO':
      case 'FECHADO':
        this.router.navigate(['/caixa/fechado']);
        break;
      case 'PAUSADO':
        this.router.navigate(['/caixa/pausado']);
        break;
      default:
        this.router.navigate(['/caixa/fechado']);
    }
  }
}
