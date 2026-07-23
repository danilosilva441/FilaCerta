import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { CaixaService, CaixaDiarioResponse } from '../../../core/services/caixa.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-fechamento-caixa',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    DecimalPipe,
    HeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './fechamento-caixa.component.html',
  styleUrls: ['./fechamento-caixa.component.css'],
})
export class FechamentoCaixaComponent implements OnInit {
  caixa = signal<CaixaDiarioResponse | null>(null);
  loading = signal(true);
  error = signal(false);
  fechando = signal(false);
  showConfirmDialog = signal(false);

  constructor(
    private caixaService: CaixaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarCaixa();
  }

  carregarCaixa(): void {
    this.loading.set(true);
    this.error.set(false);

    this.caixaService.buscarCaixaHoje().subscribe({
      next: (data) => {
        this.caixa.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  get caixaFechado(): boolean {
    return this.caixa()?.status === 'FECHADO';
  }

  get totalGeral(): number {
    const c = this.caixa();
    if (!c) return 0;
    return c.totalDinheiro + c.totalDebito + c.totalCredito + c.totalPix + c.totalFiado;
  }

  get ticketMedio(): number {
    const c = this.caixa();
    if (!c || c.totalPedidos === 0) return 0;
    return this.totalGeral / c.totalPedidos;
  }

  abrirConfirmDialog(): void {
    this.showConfirmDialog.set(true);
  }

  fecharConfirmDialog(): void {
    this.showConfirmDialog.set(false);
  }

  confirmarFechamento(): void {
    this.fechando.set(true);
    this.showConfirmDialog.set(false);

    this.caixaService.fechar().subscribe({
      next: () => {
        this.fechando.set(false);
        this.carregarCaixa();
      },
      error: (err: Error) => {
        this.fechando.set(false);
        alert(err.message || 'Erro ao fechar caixa. Tente novamente.');
      },
    });
  }

  voltar(): void {
    window.history.back();
  }

  verPedidos(): void {
    this.router.navigate(['/cozinha/painel']);
  }
}
