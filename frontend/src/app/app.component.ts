import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';

// Se os caminhos do Toast e Modal forem diferentes, mantenha os seus!
import { ToastComponent } from './shared/components/toast/toast';
import { ConfirmModalComponent } from './shared/components/confirm-modal/confirm-modal';
// Importe o serviço de autenticação! (Ajuste o caminho se necessário)
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  // Note que adicionamos RouterLink e RouterLinkActive aqui nos imports!
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ToastComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  mostrarNavbar = false;

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {
    // Esse bloco fica escutando a mudança de páginas
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Se a URL tiver caixa ou cozinha, a navbar aparece. Se não, ela some!
        this.mostrarNavbar = event.url.includes('/caixa') || event.url.includes('/cozinha');
      }
    });
  }

  // Função para deslogar do painel de administração
  logout(): void {
    if (confirm('Tem certeza que deseja sair do sistema?')) {
      this.authService.logout();
      this.mostrarNavbar = false;
      this.router.navigate(['/']); // Manda de volta para a Home da loja
    }
  }
}
