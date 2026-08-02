import { Component, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CaixaService } from '../../../core/services/caixa.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { BottomNavComponent, NavItem } from '../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-abertura-caixa',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    HeaderComponent,
    LoadingSpinnerComponent,
    BottomNavComponent,
  ],
  templateUrl: './abertura-caixa.component.html',
  styleUrls: ['./abertura-caixa.component.css'],
})
export class AberturaCaixaComponent {
  valorInicial = signal<number>(50);
  abrindo = signal(false);
  erro = signal(false);
  mensagemErro = signal('');
  sucesso = signal(false);

  readonly dataHoje = new Date();
  valoresRapidos = [0, 30, 50, 100, 150, 200];

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dono/dashboard' },
    { label: 'Cozinha', icon: 'cooking', route: '/dono/cozinha/painel' },
    { label: 'Caixa', icon: 'account_balance', route: '/dono/caixa/abertura' },
    { label: 'Mais', icon: 'more_horiz', route: '/dono/caixa/fechamento' },
  ];

  constructor(
    private caixaService: CaixaService,
    private errorHandler: ErrorHandlerService,
    private router: Router
  ) {}

  abrirCaixa(): void {
    if (this.valorInicial() < 0) {
      this.erro.set(true);
      this.mensagemErro.set('O valor inicial não pode ser negativo.');
      return;
    }

    this.abrindo.set(true);
    this.erro.set(false);

    this.caixaService.abrir().subscribe({
      next: (response: any) => {
        console.log('[Abertura] Caixa aberto com sucesso!', response);
        this.abrindo.set(false);
        this.sucesso.set(true);
        setTimeout(() => this.router.navigate(['/dono/dashboard']), 1500);
      },
      error: (err: any) => {
        console.error('[Abertura] Erro:', err);
        this.abrindo.set(false);
        this.erro.set(true);

        const mensagem = err?.mensagemAmigavel
          || err?.originalError?.message
          || err?.message
          || 'Erro ao abrir o caixa.';

        this.mensagemErro.set(mensagem);
      },
    });
  }

  selecionarValor(valor: number): void {
    this.valorInicial.set(valor);
    this.erro.set(false);
  }

  voltar(): void {
    window.history.back();
  }
}
