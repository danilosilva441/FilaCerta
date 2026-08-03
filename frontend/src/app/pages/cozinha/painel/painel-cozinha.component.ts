import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterModule } from '@angular/router';
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

export type FiltroCozinha = 'TODOS' | 'HAMBURGUER' | 'CACHORRO_QUENTE' | 'SALGADO' | 'BEBIDA';

@Component({
  selector: 'app-painel-cozinha',
  standalone: true,
  imports: [
    RouterModule,
    HeaderComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    BottomNavComponent,
  ],
  templateUrl: './painel-cozinha.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PainelCozinhaComponent implements OnInit {
  // Injeções de dependência modernas
  private cozinhaService = inject(CozinhaService);
  private pedidoService = inject(PedidoService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef); // Necessário para gerenciar o Polling com segurança

  // Estados Base
  filaResponse = signal<FilaCozinhaResponse | null>(null);
  loading = signal(true);
  error = signal(false);
  filtroAtivo = signal<FiltroCozinha>('TODOS');
  processando = signal<number | null>(null);
  showCancelDialog = signal<number | null>(null);
  cardsExpandidos = signal<Set<number>>(new Set());
  private pollingSub?: Subscription;

  // Computed Properties (Alta Performance)
  pedidosFiltrados = computed(() => {
    const response = this.filaResponse();
    if (!response?.pedidos) return [];

    const filtro = this.filtroAtivo();
    if (filtro === 'TODOS') return response.pedidos;

    return response.pedidos.filter((pedido: PedidoResumidoResponse) =>
      pedido.itens.some((item: ItemResumidoResponse) => this.getItemCategoria(item) === filtro)
    );
  });

  navItems = computed<NavItem[]>(() => [
    { label: 'Painel', icon: 'dashboard', route: '/dono/dashboard' },
    { label: 'Cozinha', icon: 'soup_kitchen', route: '/dono/cozinha/painel', badge: this.filaResponse()?.totalPedidos || 0 },
    { label: 'Comandas', icon: 'receipt_long', route: '/dono/comandas' },
    { label: 'Relatórios', icon: 'analytics', route: '/dono/relatorios/hoje' },
  ]);

  filtros: { label: string; valor: FiltroCozinha; icone: string }[] = [
    { label: 'Todos', valor: 'TODOS', icone: '📋' },
    { label: 'Burgers', valor: 'HAMBURGUER', icone: '🍔' },
    { label: 'Hot Dogs', valor: 'CACHORRO_QUENTE', icone: '🌭' },
    { label: 'Salgados', valor: 'SALGADO', icone: '🥟' },
    { label: 'Bebidas', valor: 'BEBIDA', icone: '🥤' },
  ];

  ngOnInit(): void {
    this.iniciarPolling();
  }

  // Controle de Polling Seguro
  iniciarPolling(): void {
    this.loading.set(true);
    this.error.set(false);

    // Evita duplicar requisições se o usuário clicar rápido no botão
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
    }

    this.pollingSub = timer(0, environment.pollingIntervalMs)
      .pipe(
        takeUntilDestroyed(this.destroyRef), // Limpa automaticamente quando sair da página
        switchMap(() => this.cozinhaService.listarFila()),
        tap((response) => {
          const anterior = this.filaResponse();
          this.filaResponse.set(response);
          this.loading.set(false);
          this.error.set(false);

          if (anterior && response.totalPedidos > anterior.totalPedidos) {
            this.notificationService.tocarAlerta('novo-pedido');
            this.notificationService.vibrar([200, 100, 200]);
          }
        })
      )
      .subscribe({
        error: (err) => {
          console.error('[Cozinha] Erro no polling:', err);
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }

  // Navegações chamadas pelo HTML
  irParaDashboard(): void {
    this.router.navigate(['/dono/dashboard']);
  }

  verPagamento(pedidoId: number): void {
    this.router.navigate(['/dono/caixa/pagamento', pedidoId]);
  }

  // Helpers Visuais chamados pelo HTML
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'RECEBIDO': 'border-blue-400 bg-blue-50',
      'PREPARANDO': 'border-orange-400 bg-orange-50',
      'PRONTO': 'border-green-400 bg-green-50',
    };
    return colors[status] || 'border-gray-200 bg-white';
  }

  getItemCategoria(item: ItemResumidoResponse): FiltroCozinha {
    const nome = item.nomeProduto.toUpperCase();
    if (nome.includes('BURGER') || nome.includes('BURGUER') || nome.includes('BACON') || nome.includes('SALADA')) return 'HAMBURGUER';
    if (nome.includes('HOT DOG') || nome.includes('CACHORRO')) return 'CACHORRO_QUENTE';
    if (nome.includes('COXINHA') || nome.includes('PASTEL') || nome.includes('TORTA') || nome.includes('SALGADO')) return 'SALGADO';
    if (nome.includes('REFRIGERANTE') || nome.includes('SUCO') || nome.includes('ÁGUA') || nome.includes('CERVEJA')) return 'BEBIDA';
    return 'TODOS';
  }

  getTempoEspera(dataHoraPedido: string): string {
    const inicio = new Date(dataHoraPedido).getTime();
    const agora = Date.now();
    const minutos = Math.floor((agora - inicio) / 60000);
    if (minutos < 1) return 'Agora';
    if (minutos < 60) return `${minutos}min`;
    return `${Math.floor(minutos / 60)}h ${minutos % 60}min`;
  }

  // Ações de Estado do Pedido
  toggleCard(pedidoId: number): void {
    const expandidos = new Set(this.cardsExpandidos());
    expandidos.has(pedidoId) ? expandidos.delete(pedidoId) : expandidos.add(pedidoId);
    this.cardsExpandidos.set(expandidos);
  }

  isExpanded(pedidoId: number): boolean {
    return this.cardsExpandidos().has(pedidoId);
  }

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

  // Fluxo de Cancelamento
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

  // Ações de Itens Individuais
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
