import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

import { ToastComponent } from './shared/components/toast/toast';
import { ConfirmModalComponent } from './shared/components/confirm-modal/confirm-modal';
import { NavbarComponent } from './shared/components/navbar/navbar';
import { AuthService } from './core/services/auth.service';
import { LgpdBannerComponent } from './shared/components/lgpd-banner/lgpd-banner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ToastComponent,
    ConfirmModalComponent,
    NavbarComponent,
    LgpdBannerComponent,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  mostrarNavbar = false;

  isVerificandoSessao = signal<boolean>(true);

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        const url = event.urlAfterRedirects || event.url;
        const isDono = this.authService.isDono();

        // Trocamos 'admin' por 'estoque'
        const isRotaAdmin =
          url.includes('/caixa') || url.includes('/cozinha') || url.includes('/estoque');
        const isCardapio = url.includes('/cardapio');

        this.mostrarNavbar = isRotaAdmin || (isCardapio && isDono);
      });
  }

  ngOnInit() {
    this.authService.verificarToken().subscribe({
      next: (valido: boolean) => {
        // Se for inválido, o seu AuthGuard já deve fazer o redirecionamento
        this.isVerificandoSessao.set(false); // Esconde o carregamento e mostra o sistema
      },
      error: () => this.isVerificandoSessao.set(false),
    });
  }
}
