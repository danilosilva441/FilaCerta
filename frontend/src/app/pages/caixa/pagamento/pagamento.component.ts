import { Component, OnInit, signal, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common'; // CommonModule substituído para otimizar memória
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  MetodoPagamento,
  PedidoResponse
} from '../../../core/models';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { BottomNavComponent, NavItem } from '../../../shared/components/bottom-nav/bottom-nav.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

interface MetodoPagamentoVisual {
  valor: MetodoPagamento;
  label: string;
  icone: string;
}

@Component({
  selector: 'app-pagamento',
  standalone: true,
  imports: [
    FormsModule,
    DecimalPipe,
    DatePipe,
    HeaderComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    BottomNavComponent,
  ],
  templateUrl: './pagamento.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush, // Performance máxima
})
export class PagamentoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pedidoService = inject(PedidoService);
  private errorHandler = inject(ErrorHandlerService);

  // Estados Base
  pedido = signal<PedidoResponse | null>(null);
  loading = signal(true);
  error = signal(false);
  metodoSelecionado = signal<MetodoPagamento | null>(null);
  valorRecebido = signal<number>(0);
  processando = signal(false);
  sucesso = signal(false);
  showConfirmDialog = signal(false);

  // ✨ COMPUTED SIGNALS (Substituem os antigos getters)
  troco = computed(() => {
    return Math.max(0, this.valorRecebido() - (this.pedido()?.valorTotal || 0));
  });

  podeConfirmar = computed(() => {
    const metodo = this.metodoSelecionado();
    if (!metodo) return false;
    if (metodo === 'FIADO') return true;
    if (metodo === 'DINHEIRO') return this.valorRecebido() >= (this.pedido()?.valorTotal || 0);
    return true;
  });

  navItems = computed<NavItem[]>(() => [
    { label: 'Painel', icon: 'dashboard', route: '/dono/dashboard' },
    { label: 'Cozinha', icon: 'soup_kitchen', route: '/dono/cozinha/painel' },
    { label: 'Comandas', icon: 'receipt_long', route: '/dono/comandas' },
    { label: 'Relatórios', icon: 'analytics', route: '/dono/relatorios/hoje' },
  ]);

  metodosPagamento: MetodoPagamentoVisual[] = [
    { valor: 'DINHEIRO', label: 'Dinheiro', icone: 'payments' },
    { valor: 'CARTAO_DEBITO', label: 'Débito', icone: 'credit_card' },
    { valor: 'CARTAO_CREDITO', label: 'Crédito', icone: 'credit_score' },
    { valor: 'PIX', label: 'PIX', icone: 'pix' },
    { valor: 'FIADO', label: 'Fiado', icone: 'receipt_long' },
  ];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.carregarPedido(id);
    } else {
      this.error.set(true);
      this.loading.set(false);
    }
  }

  carregarPedido(id: number): void {
    this.loading.set(true);
    this.error.set(false);

    this.pedidoService.buscarPorId(id).subscribe({
      next: (data) => {
        this.pedido.set(data);
        if (data.metodoPagamento) {
          this.metodoSelecionado.set(data.metodoPagamento as MetodoPagamento);
        }
        if (data.statusPagamento === 'PAGO') this.sucesso.set(true);
        this.valorRecebido.set(data.valorTotal);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  selecionarMetodo(metodo: MetodoPagamento): void {
    this.metodoSelecionado.set(metodo);
    if (metodo === 'DINHEIRO') this.valorRecebido.set(this.pedido()?.valorTotal || 0);
  }

  abrirConfirmDialog(): void { this.showConfirmDialog.set(true); }
  fecharConfirmDialog(): void { this.showConfirmDialog.set(false); }

  confirmarPagamento(): void {
    const pedidoId = this.pedido()?.id;
    const metodo = this.metodoSelecionado();
    if (!pedidoId || !metodo) return;

    this.processando.set(true);
    this.showConfirmDialog.set(false);

    this.pedidoService.registrarPagamento(pedidoId, { metodoPagamento: metodo }, true).subscribe({
      next: (data) => {
        this.pedido.set(data);
        this.processando.set(false);
        this.sucesso.set(true);
      },
      error: (err: any) => {
        this.processando.set(false);
        const mensagem = err?.mensagemAmigavel || err?.message || 'Erro ao registrar pagamento.';
        alert(mensagem);
      },
    });
  }

  voltar(): void { window.history.back(); }
  irParaCozinha(): void { this.router.navigate(['/dono/cozinha/painel']); }
  irParaDashboard(): void { this.router.navigate(['/dono/dashboard']); }
}
