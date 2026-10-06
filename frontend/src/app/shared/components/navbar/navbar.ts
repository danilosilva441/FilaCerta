import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /** Controla a exibição do modal de confirmação */
  mostrarConfirmacao = false;

  confirmarLogout(): void {
    this.mostrarConfirmacao = true;
  }

  cancelarLogout(): void {
    this.mostrarConfirmacao = false;
  }

  logout(): void {
    this.authService.logout();
    this.mostrarConfirmacao = false;
    this.router.navigate(['/']);
  }
}
