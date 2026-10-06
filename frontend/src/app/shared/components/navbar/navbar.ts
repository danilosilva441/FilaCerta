import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ModalService } from '../../../core/services/modal.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class NavbarComponent {
  private readonly modalService = inject(ModalService);
  public readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  menuAberto = signal(false);

  toggleMenu(): void {
    this.menuAberto.set(!this.menuAberto());
  }

  fecharMenu(): void {
    this.menuAberto.set(false);
  }

  confirmarLogout(): void {
    this.fecharMenu();
    this.modalService.confirmar({
      titulo: 'Sair do sistema?',
      mensagem: 'Você precisará fazer login novamente...',
      tipo: 'perigo',
      textoConfirmar: 'Sim, sair',
      textoCancelar: 'Cancelar',
      onConfirm: () => {
        this.authService.logout();
        this.router.navigate(['/login']);
      },
    });
  }
}
