import { Component, OnInit, signal, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common'; // CommonModule removido para poupar memória
import { Router } from '@angular/router';
import { CaixaService, CaixaDiarioResponse } from '../../../core/services/caixa.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { BottomNavComponent, NavItem } from '../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-fechamento-caixa',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    HeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    BottomNavComponent,
  ],
  templateUrl: './fechamento-caixa.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush, // Performance máxima
})
export class FechamentoCaixaComponent implements OnInit {
  private caixaService = inject(CaixaService);
  private errorHandler = inject(ErrorHandlerService);
  private router = inject(Router);

  // Estados Base
  caixa = signal<CaixaDiarioResponse | null>(null);
  loading = signal(true);
  error = signal(false);
  fechando = signal(false);
  showConfirmDialog = signal(false);

  // ✨ COMPUTED SIGNALS (Substituem os antigos getters para alta performance)
  caixaFechado = computed(() => this.caixa()?.status === 'FECHADO');

  totalGeral = computed(() => {
    const c = this.caixa();
    if (!c) return 0;
    return (c as any).valorTotalConcluidos ||
      (c.totalDinheiro + c.totalDebito + c.totalCredito + c.totalPix + c.totalFiado);
  });

  totalConcluidos = computed(() => (this.caixa() as any)?.totalConcluidos || 0);

  ticketMedio = computed(() => {
    const c = this.caixa();
    if (!c || c.totalPedidos === 0) return 0;
    return this.totalGeral() / c.totalPedidos;
  });

  navItems = computed<NavItem[]>(() => [
    { label: 'Painel', icon: 'dashboard', route: '/dono/dashboard' },
    { label: 'Cozinha', icon: 'soup_kitchen', route: '/dono/cozinha/painel' },
    { label: 'Comandas', icon: 'receipt_long', route: '/dono/comandas' },
    { label: 'Relatórios', icon: 'analytics', route: '/dono/relatorios/hoje' },
  ]);

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

  abrirConfirmDialog(): void { this.showConfirmDialog.set(true); }
  fecharConfirmDialog(): void { this.showConfirmDialog.set(false); }

  confirmarFechamento(): void {
    this.fechando.set(true);
    this.showConfirmDialog.set(false);

    this.caixaService.fechar().subscribe({
      next: () => {
        this.fechando.set(false);
        this.carregarCaixa();
      },
      error: (err: any) => {
        this.fechando.set(false);
        const mensagem = err?.mensagemAmigavel || err?.message || 'Erro ao fechar caixa.';
        alert(mensagem);
      },
    });
  }

  voltar(): void { window.history.back(); }
  verPedidos(): void { this.router.navigate(['/dono/cozinha/painel']); }
  irParaDashboard(): void { this.router.navigate(['/dono/dashboard']); }
}
