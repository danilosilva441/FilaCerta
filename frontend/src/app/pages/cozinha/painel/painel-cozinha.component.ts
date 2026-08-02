import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, switchMap, tap, timer } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  FilaCozinhaResponse,
  ItemResumidoResponse,
  PedidoResumidoResponse,
  StatusItemPedido,
} from '../../../core/models';
import { CozinhaService } from '../../../core/services/cozinha.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { BottomNavComponent, NavItem } from '../../../shared/components/bottom-nav/bottom-nav.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

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
    BottomNavComponent,
  ],
  templateUrl: './painel-cozinha.component.html',
  styleUrls: ['./painel-cozinha.component.css'],
})
export class PainelCozinhaComponent implements OnInit, OnDestroy {
  filaResponse = signal<FilaCozinhaResponse | null>(null);
  loading = signal(true);
  error = signal(false);
  filtroAtivo = signal<FiltroCozinha>('TODOS');

  filtros: { label: string; valor: FiltroCozinha; icone: string }[] = [
    { label: 'Todos', valor: 'TODOS', icone: '📋' },
    { label: 'Burgers', valor: 'HAMBURGUER', icone: '🍔' },
    { label: 'Hot Dogs', valor: 'CACHORRO_QUENTE', icone: '🌭' },
    { label: 'Salgados', valor: 'SALGADO', icone: '🥟' },
    { label: 'Bebidas', valor: 'BEBIDA', icone: '🥤' },
  ];

  processando = signal<number | null>(null);
  showCancelDialog = signal<number | null>(null);
  cardsExpandidos = signal<Set<number>>(new Set());
  private pollingSub?: Subscription;

  constructor(
    private cozinhaService: CozinhaService,
    private pedidoService: PedidoService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void { this.iniciarPolling(); }
  ngOnDestroy(): void { this.pollingSub?.unsubscribe(); }

  iniciarPolling(): void {
    this.pollingSub = timer(0, environment.pollingIntervalMs)
      .pipe(
        switchMap(() => this.cozinhaService.listarFila()),
        tap((response) => {
          const anterior = this.filaResponse();
          this.filaResponse.set(response);
          this.loading.set(false);
          if (anterior && response.totalPedidos > anterior.totalPedidos) {
            this.notificationService.tocarAlerta('novo-pedido');
            this.notificationService.vibrar([200, 100, 200]);
          }
        })
      )
      .subscribe({
        error: () => { this.error.set(true); this.loading.set(false); },
      });
  }

  get pedidosFiltrados(): PedidoResumidoResponse[] {
    const response = this.filaResponse();
    if (!response?.pedidos) return [];
    const filtro = this.filtroAtivo();
    if (filtro === 'TODOS') return response.pedidos;
    return response.pedidos.filter((pedido: PedidoResumidoResponse) =>
      pedido.itens.some((item: ItemResumidoResponse) => this.getItemCategoria(item) === filtro)
    );
  }

  getItemCategoria(item: ItemResumidoResponse): FiltroCozinha {
    const nome = item.nomeProduto.toUpperCase();
    if (nome.includes('BURGER') || nome.includes('BURGUER') || nome.includes('BACON') || nome.includes('SALADA')) return 'HAMBURGUER';
    if (nome.includes('HOT DOG') || nome.includes('CACHORRO')) return 'CACHORRO_QUENTE';
    if (nome.includes('COXINHA') || nome.includes('PASTEL') || nome.includes('TORTA') || nome.includes('SALGADO')) return 'SALGADO';
    if (nome.includes('REFRIGERANTE') || nome.includes('SUCO') || nome.includes('ÁGUA') || nome.includes('CERVEJA')) return 'BEBIDA';
    return 'TODOS';
  }

  toggleCard(pedidoId: number): void {
    const expandidos = new Set(this.cardsExpandidos());
    expandidos.has(pedidoId) ? expandidos.delete(pedidoId) : expandidos.add(pedidoId);
    this.cardsExpandidos.set(expandidos);
  }

  isExpanded(pedidoId: number): boolean { return this.cardsExpandidos().has(pedidoId); }

  iniciarPreparo(pedidoId: number): void {
    this.processando.set(pedidoId);
    this.cozinhaService.iniciarPreparo(pedidoId).subscribe({
      next: () => this.processando.set(null),
      error: () => { this.processando.set(null); alert('Erro ao iniciar preparo.'); },
    });
  }

  marcarPronto(pedidoId: number): void {
    this.processando.set(pedidoId);
    this.cozinhaService.marcarPronto(pedidoId).subscribe({
      next: () => this.processando.set(null),
      error: () => { this.processando.set(null); alert('Erro ao marcar como pronto.'); },
    });
  }

  entregarPedido(pedidoId: number): void {
    this.processando.set(pedidoId);
    this.cozinhaService.entregarPedido(pedidoId).subscribe({
      next: () => this.processando.set(null),
      error: () => { this.processando.set(null); alert('Erro ao entregar pedido.'); },
    });
  }

  abrirCancelDialog(pedidoId: number): void { this.showCancelDialog.set(pedidoId); }
  fecharCancelDialog(): void { this.showCancelDialog.set(null); }

  confirmarCancelamento(): void {
    const pedidoId = this.showCancelDialog();
    if (!pedidoId) return;
    this.processando.set(pedidoId);
    this.showCancelDialog.set(null);
    this.pedidoService.cancelar(pedidoId).subscribe({
      next: () => this.processando.set(null),
      error: () => { this.processando.set(null); alert('Erro ao cancelar pedido.'); },
    });
  }

  verPagamento(pedidoId: number): void { this.router.navigate(['/dono/caixa/pagamento', pedidoId]); }
  irParaDashboard(): void { this.router.navigate(['/dono/dashboard']); }
  irParaFechamento(): void { this.router.navigate(['/dono/caixa/fechamento']); }

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

  get navItems(): NavItem[] {
    return [
      { label: 'Dashboard', icon: 'dashboard', route: '/dono/dashboard' },
      { label: 'Cozinha', icon: 'cooking', route: '/dono/cozinha/painel', badge: this.filaResponse()?.totalPedidos || 0 },
      { label: 'Caixa', icon: 'account_balance', route: '/dono/caixa/abertura' },
      { label: 'Mais', icon: 'more_horiz', route: '/dono/caixa/fechamento' },
    ];
  }

  alternarStatusItem(pedidoId: number, itemId: number, statusAtual: string): void {
    let novoStatus: StatusItemPedido;
    switch (statusAtual) {
      case 'PENDENTE': novoStatus = 'PREPARANDO'; break;
      case 'PREPARANDO': novoStatus = 'PRONTO'; break;
      case 'PRONTO': novoStatus = 'PENDENTE'; break;
      default: novoStatus = 'PREPARANDO';
    }
    this.cozinhaService.atualizarStatusItem(pedidoId, itemId, novoStatus).subscribe({
      next: () => this.atualizarItemLocal(pedidoId, itemId, novoStatus),
      error: (err) => { console.error('[Painel] Erro ao atualizar item:', err); alert('Erro ao atualizar status do item.'); },
    });
  }

  atualizarItemLocal(pedidoId: number, itemId: number, novoStatus: StatusItemPedido): void {
    const response = this.filaResponse();
    if (!response) return;
    const pedidos = response.pedidos.map(pedido => {
      if (pedido.id === pedidoId) {
        return { ...pedido, itens: pedido.itens.map(item => item.id === itemId ? { ...item, status: novoStatus } : item) };
      }
      return pedido;
    });
    this.filaResponse.set({ ...response, pedidos });
  }
}
