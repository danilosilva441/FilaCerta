import { Component, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CaixaService } from '../../../core/services/caixa.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-abertura-caixa',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    HeaderComponent,
    LoadingSpinnerComponent,
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

  // Data formatada para exibição
  readonly dataHoje = new Date();

  // Valores rápidos para facilitar no mobile
  valoresRapidos = [0, 30, 50, 100, 150, 200];

  constructor(
    private caixaService: CaixaService,
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

      setTimeout(() => {
        this.router.navigate(['/cliente/cardapio']);
      }, 1500);
    },
    error: (err: Error) => {
      console.error('[Abertura] Erro:', err);
      this.abrindo.set(false);
      this.erro.set(true);
      this.mensagemErro.set(err.message || 'Erro ao abrir o caixa.');
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
