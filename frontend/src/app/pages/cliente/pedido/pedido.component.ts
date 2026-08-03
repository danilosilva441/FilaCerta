import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common'; // Importação super leve no lugar do CommonModule
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer, switchMap, tap } from 'rxjs';

import { PedidoService } from '../../../core/services/pedido.service';
import { AuthService } from '../../../core/services/auth.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PedidoResponse, StatusPedido } from '../../../core/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-pedido',
  standalone: true,
  imports: [
    DecimalPipe,
    DatePipe,
    FormsModule,
    RouterModule,
    HeaderComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './pedido.component.html',
  // OnPush + Computed garante que a bateria do cliente não seja drenada pelas atualizações da tela
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PedidoComponent implements OnInit {
  // Injeções de Dependência
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pedidoService = inject(PedidoService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef); // Usado para encerrar o polling ao fechar a tela

  // Estados Base
  pedido = signal<PedidoResponse | null>(null);
  loading = signal(true);
  error = signal(false);

  // Estados de Interface
  editando = signal(false);
  observacaoEdicao = signal('');
  showCancelDialog = signal(false);
  cancelando = signal(false);

  // ✨ Computed Signals (Substituem os antigos 'get()')
  // Eles guardam o resultado em cache e só recalcula se o 'this.pedido()' mudar!
  nomeCliente = computed(() => this.authService.usuario()?.nomeCliente || '');

  statusIcon = computed(() => {
    const icons: Record<StatusPedido, string> = {
      RECEBIDO: '📋', PREPARANDO: '🔥', PRONTO: '✅', ENTREGUE: '📦', CANCELADO: '❌',
    };
    return icons[this.pedido()?.status || 'RECEBIDO'];
  });

  statusMensagem = computed(() => {
    const msgs: Record<StatusPedido, string> = {
      RECEBIDO: 'Pedido recebido! Aguardando preparo...',
      PREPARANDO: 'Seu pedido está sendo preparado!',
      PRONTO: 'Pronto! Dirija-se ao balcão.',
      ENTREGUE: 'Pedido entregue. Bom apetite! 🍔',
      CANCELADO: 'Pedido cancelado.',
    };
    return msgs[this.pedido()?.status || 'RECEBIDO'];
  });

  podeCancelar = computed(() => {
    const status = this.pedido()?.status;
    return status === 'RECEBIDO' || status === 'PREPARANDO';
  });

  podeEditar = computed(() => this.pedido()?.status === 'RECEBIDO');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.iniciarMonitoramento(id);
    } else {
      this.error.set(true);
      this.loading.set(false);
    }
  }

  // ──── Polling Dinâmico ────
  // Atualiza o pedido sozinho a cada X segundos para o cliente ver o status em tempo real
  iniciarMonitoramento(id: number): void {
    timer(0, environment.pollingIntervalMs || 10000)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(() => this.pedidoService.buscarPorId(id)),
      )
      .subscribe({
        next: (data) => {
          this.pedido.set(data);
          this.loading.set(false);
          this.error.set(false);
        },
        error: (err) => {
          console.error('Falha ao atualizar pedido', err);
          // Só mostra a tela de erro fatal se for a primeira vez carregando
          if (!this.pedido()) {
            this.error.set(true);
            this.loading.set(false);
          }
        },
      });
  }

  // ──── Cancelamento ────
  abrirCancelDialog(): void { this.showCancelDialog.set(true); }
  fecharCancelDialog(): void { this.showCancelDialog.set(false); }

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
    // TODO: Adicionar chamada a API caso precise salvar (ex: this.pedidoService.atualizarObservacao)
    this.editando.set(false);
  }

  // ──── Navegação ────
  adicionarItens(): void {
    this.router.navigate(['/cliente/cardapio'], { queryParams: { pedidoId: this.pedido()?.id } });
  }

  novoPedido(): void { this.router.navigate(['/cliente/cardapio']); }
  voltarCardapio(): void { this.router.navigate(['/cliente/cardapio']); }
}
