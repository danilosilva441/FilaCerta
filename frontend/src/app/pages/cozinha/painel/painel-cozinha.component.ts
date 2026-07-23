import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, timer, switchMap, tap } from 'rxjs';
import { CozinhaService } from '../../../core/services/cozinha.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { NotificationService } from '../../../core/services/notification.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import {
  FilaCozinhaResponse,
  PedidoResumidoResponse,
  ItemResumidoResponse,
  StatusPedido,
  StatusItemPedido,
} from '../../../core/models';
import { environment } from '../../../../environments/environment';

type FiltroCozinha = 'TODOS' | 'HAMBURGUER' | 'CACHORRO_QUENTE' | 'SALGADO' | 'BEBIDA';

@Component({
  selector: 'app-painel-cozinha',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './painel-cozinha.component.html',
  styleUrls: ['./painel-cozinha.component.css'],
})
export class PainelCozinhaComponent implements OnInit, OnDestroy {
  filaResponse = signal<FilaCozinhaResponse | null>(null);
  loading = signal(true);
  error = signal(false);

  // Filtros
  filtroAtivo = signal<FiltroCozinha>('TODOS');
  filtros: { label: string; valor: FiltroCozinha; icone: string }[] = [
    { label: 'Todos', valor: 'TODOS', icone: '📋' },
    { label: 'Burgers', valor: 'HAMBURGUER', icone: '🍔' },
    { label: 'Hot Dogs', valor: 'CACHORRO_QUENTE', icone: '🌭' },
    { label: 'Salgados', valor: 'SALGADO', icone: '🥟' },
    { label: 'Bebidas', valor: 'BEBIDA', icone: '🥤' },
  ];

  // Ações
  processando = signal<number | null>(null);
  showCancelDialog = signal<number | null>(null);

  // Cards expandidos
  cardsExpandidos = signal<Set<number>>(new Set());

  private pollingSub?: Subscription;

  constructor(
    private cozinhaService: CozinhaService,
    private pedidoService: PedidoService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.iniciarPolling();
  }

  ngOnDestroy(): void {
    this.pollingSub?.unsubscribe();
  }

  iniciarPolling(): void {
    this.pollingSub = timer(0, environment.pollingIntervalMs)
      .pipe(
        switchMap(() => this.cozinhaService.listarFila()),
        tap((response) => {
          const anterior = this.filaResponse();
          this.filaResponse.set(response);
          this.loading.set(false);

          // Notificar novos pedidos
          if (anterior && response.totalPedidos > anterior.totalPedidos) {
            this.notificationService.tocarAlerta('novo-pedido');
            this.notificationService.vibrar([200, 100, 200]);
          }
        })
      )
      .subscribe({
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }

  // ──── Filtros ────

  get pedidosFiltrados(): PedidoResumidoResponse[] {
    const response = this.filaResponse();
    if (!response?.pedidos) return [];

    const filtro = this.filtroAtivo();
    if (filtro === 'TODOS') return response.pedidos;

    return response.pedidos.filter((pedido) =>
      pedido.itens.some((item) => this.getItemCategoria(item) === filtro)
    );
  }

  getItemCategoria(item: ItemResumidoResponse): FiltroCozinha {
    const nome = item.nomeProduto.toUpperCase();
    if (nome.includes('BURGER') || nome.includes('BURGUER') || nome.includes('BACON') || nome.includes('SALADA')) return 'HAMBURGUER';
    if (nome.includes('HOT DOG') || nome.includes('CACHORRO')) return 'CACHORRO_QUENTE';
    if (nome.includes('COXINHA') || nome.includes('PASTEL') || nome.includes('TORTA') || nome.includes('SALGADO')) return 'SALGADO';
    if (nome.includes('REFRIGERANTE') || nome.includes('SUCO') || nome.includes('ÁGUA') || nome.includes('CERVEJA') || nome.includes('BEBIDA')) return 'BEBIDA';
    return 'TODOS';
  }

  // ──── Cards Expandidos ────

  toggleCard(pedidoId: number): void {
    const expandidos = new Set(this.cardsExpandidos());
    if (expandidos.has(pedidoId)) {
      expandidos.delete(pedidoId);
    } else {
      expandidos.add(pedidoId);
    }
    this.cardsExpandidos.set(expandidos);
  }

  isExpanded(pedidoId: number): boolean {
    return this.cardsExpandidos().has(pedidoId);
  }

  // ──── Ações do Pedido ────

  iniciarPreparo(pedidoId: number): void {
    this.processando.set(pedidoId);
    this.cozinhaService.iniciarPreparo(pedidoId).subscribe({
      next: () => this.processando.set(null),
      error: () => {
        this.processando.set(null);
        alert('Erro ao iniciar preparo.');
      },
    });
  }

  marcarPronto(pedidoId: number): void {
    this.processando.set(pedidoId);
    this.cozinhaService.marcarPronto(pedidoId).subscribe({
      next: () => this.processando.set(null),
      error: () => {
        this.processando.set(null);
        alert('Erro ao marcar como pronto.');
      },
    });
  }

  entregarPedido(pedidoId: number): void {
    this.processando.set(pedidoId);
    this.cozinhaService.entregarPedido(pedidoId).subscribe({
      next: () => this.processando.set(null),
      error: () => {
        this.processando.set(null);
        alert('Erro ao entregar pedido.');
      },
    });
  }

  // ──── Cancelamento ────

  abrirCancelDialog(pedidoId: number): void {
    this.showCancelDialog.set(pedidoId);
  }

  fecharCancelDialog(): void {
    this.showCancelDialog.set(null);
  }

  confirmarCancelamento(): void {
    const pedidoId = this.showCancelDialog();
    if (!pedidoId) return;

    this.processando.set(pedidoId);
    this.showCancelDialog.set(null);

    this.pedidoService.cancelar(pedidoId).subscribe({
      next: () => this.processando.set(null),
      error: () => {
        this.processando.set(null);
        alert('Erro ao cancelar pedido.');
      },
    });
  }

  // ──── Navegação ────

  verPagamento(pedidoId: number): void {
    this.router.navigate(['/caixa/pagamento', pedidoId]);
  }

  irParaFechamento(): void {
    this.router.navigate(['/caixa/fechamento']);
  }

  // ──── Status ────

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'RECEBIDO': 'border-blue-400 bg-blue-50',
      'PREPARANDO': 'border-orange-400 bg-orange-50',
      'PRONTO': 'border-green-400 bg-green-50',
    };
    return colors[status] || 'border-gray-200 bg-white';
  }

  getTempoEspera(dataHoraPedido: string): string {
    const inicio = new Date(dataHoraPedido).getTime();
    const agora = Date.now();
    const minutos = Math.floor((agora - inicio) / 60000);
    if (minutos < 1) return 'Agora';
    if (minutos < 60) return `${minutos}min`;
    return `${Math.floor(minutos / 60)}h ${minutos % 60}min`;
  }
}
