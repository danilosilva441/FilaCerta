import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map, catchError, of } from 'rxjs';
import { CaixaService } from '../services/caixa.service';

@Injectable({
  providedIn: 'root'
})
export class CaixaAbertoGuard implements CanActivate {

  constructor(
    private caixaService: CaixaService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.caixaService.buscarCaixaHoje().pipe(
      map(caixa => {
        if (caixa?.status === 'ABERTO') {
          return true; // Permite acesso
        }
        // Redireciona para abertura do caixa
        this.router.navigate(['/caixa/abertura']);
        return false;
      }),
      catchError(() => {
        // Se não há caixa hoje, redireciona para abrir
        this.router.navigate(['/caixa/abertura']);
        return of(false);
      })
    );
  }
}
