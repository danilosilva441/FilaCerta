import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CaixaService, StatusCaixaResponse } from '../../core/services/caixa.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  statusCaixa = signal<StatusCaixaResponse | null>(null);
  loading = signal(true);
  isCliente = signal(false);

  constructor(
    private caixaService: CaixaService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.verificarStatus();
    this.isCliente.set(this.authService.isCliente());
  }

  verificarStatus(): void {
    this.loading.set(true);
    this.caixaService.getStatus().subscribe({
      next: (status: StatusCaixaResponse) => {
        this.statusCaixa.set(status);
        this.loading.set(false);
      },
      error: () => {
        this.statusCaixa.set({
          status: 'NAO_ABERTO',
          mensagem: '📭 Verificando...',
          mensagemDetalhada: 'Aguardando status do estabelecimento.',
          icone: '📭',
          podePedir: false,
        });
        this.loading.set(false);
      },
    });
  }

  irParaCardapio(): void {
    if (this.isCliente()) {
      this.router.navigate(['/cliente/cardapio']);
    } else {
      this.router.navigate(['/cliente/login']);
    }
  }

  irParaLogin(): void {
    this.router.navigate(['/cliente/login']);
  }

  irParaLoginDono(): void {
    this.router.navigate(['/dono/login']);
  }

  get podePedir(): boolean {
    return this.statusCaixa()?.podePedir ?? false;
  }

  get statusIcon(): string {
    const icons: Record<string, string> = {
      'ABERTO': '🟢',
      'PAUSADO': '⏸️',
      'FECHADO': '🔒',
      'NAO_ABERTO': '📭',
    };
    return icons[this.statusCaixa()?.status || 'NAO_ABERTO'] || '📭';
  }
}
