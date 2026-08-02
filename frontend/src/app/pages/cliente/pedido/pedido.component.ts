import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PedidoService } from '../../../core/services/pedido.service';
import { AuthService } from '../../../core/services/auth.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PedidoResponse, StatusPedido } from '../../../core/models';

@Component({
  selector: 'app-pedido',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HeaderComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './pedido.component.html',
  styleUrls: ['./pedido.component.css'],
})
export class PedidoComponent implements OnInit {
  pedido = signal<PedidoResponse | null>(null);
  loading = signal(true);
  error = signal(false);

  // Edição de itens
  editando = signal(false);
  observacaoEdicao = signal('');

  // Cancelamento
  showCancelDialog = signal(false);
  cancelando = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pedidoService: PedidoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.carregarPedido(id);
    } else {
      this.error.set(true);
      this.loading.set(false);
    }
  }

  /** Nome do cliente logado */
  get nomeCliente(): string {
    return this.authService.usuario()?.nomeCliente || '';
  }

  carregarPedido(id: number): void {
    this.loading.set(true);
    this.error.set(false);

    this.pedidoService.buscarPorId(id).subscribe({
      next: (data) => {
        this.pedido.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  // ──── Status ────

  get statusIcon(): string {
    const icons: Record<StatusPedido, string> = {
      RECEBIDO: '📋',
      PREPARANDO: '🔥',
      PRONTO: '✅',
      ENTREGUE: '📦',
      CANCELADO: '❌',
    };
    return icons[this.pedido()?.status || 'RECEBIDO'];
  }

  get statusMensagem(): string {
    const msgs: Record<StatusPedido, string> = {
      RECEBIDO: 'Pedido recebido! Aguardando preparo...',
      PREPARANDO: 'Seu pedido está sendo preparado!',
      PRONTO: 'Pronto! Dirija-se ao balcão.',
      ENTREGUE: 'Pedido entregue. Bom apetite! 🍔',
      CANCELADO: 'Pedido cancelado.',
    };
    return msgs[this.pedido()?.status || 'RECEBIDO'];
  }

  get podeCancelar(): boolean {
    const status = this.pedido()?.status;
    return status === 'RECEBIDO' || status === 'PREPARANDO';
  }

  get podeEditar(): boolean {
    return this.pedido()?.status === 'RECEBIDO';
  }

  // ──── Cancelamento ────

  abrirCancelDialog(): void {
    this.showCancelDialog.set(true);
  }

  fecharCancelDialog(): void {
    this.showCancelDialog.set(false);
  }

  confirmarCancelamento(): void {
    const pedidoId = this.pedido()?.id;
    if (!pedidoId) return;

    this.cancelando.set(true);

    this.pedidoService.cancelar(pedidoId).subscribe({
      next: (data) => {
        this.pedido.set(data);
        this.cancelando.set(false);
        this.showCancelDialog.set(false);
      },
      error: () => {
        this.cancelando.set(false);
        this.showCancelDialog.set(false);
        alert('Erro ao cancelar pedido. Tente novamente.');
      },
    });
  }

  // ──── Edição ────

  abrirEdicao(): void {
    this.observacaoEdicao.set(this.pedido()?.observacao || '');
    this.editando.set(true);
  }

  fecharEdicao(): void {
    this.editando.set(false);
  }

  salvarEdicao(): void {
    this.editando.set(false);
  }

  // ──── Adicionar Itens ────

  adicionarItens(): void {
    this.router.navigate(['/cliente/cardapio'], {
      queryParams: { pedidoId: this.pedido()?.id }
    });
  }

  // ──── Navegação ────

  novoPedido(): void {
    this.router.navigate(['/cliente/cardapio']);
  }

  voltarCardapio(): void {
    this.router.navigate(['/cliente/cardapio']);
  }

  voltarAcompanhamento(): void {
    const id = this.pedido()?.id;
    if (id) {
      this.router.navigate(['/cliente/acompanhamento', id]);
    } else {
      this.router.navigate(['/cliente/cardapio']);
    }
  }
}
