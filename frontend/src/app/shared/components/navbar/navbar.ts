import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
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
  private readonly elementRef = inject(ElementRef);

  menuAberto = signal(false);

  constructor() {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.fecharMenu());
  }

  toggleMenu(): void {
    this.menuAberto.set(!this.menuAberto());
  }

  @HostListener('document:click', ['$event'])
  aoClicarFora(event: MouseEvent): void {
    if (!this.menuAberto()) return;

    const dropdown = (this.elementRef.nativeElement as HTMLElement).querySelector(
      '.bottom-nav-item-dropdown',
    );

    if (dropdown && !dropdown.contains(event.target as Node)) {
      this.fecharMenu();
    }
  }

  @HostListener('document:keydown.escape')
  aoApertarEsc(): void {
    this.fecharMenu();
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
