import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription, timer, switchMap, tap } from 'rxjs';
import { PedidoService } from '../../../core/services/pedido.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { BottomNavComponent, NavItem } from '../../../shared/components/bottom-nav/bottom-nav.component';
import { PedidoResponse, StatusPedido } from '../../../core/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-acompanhamento',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    DecimalPipe,
    RouterModule,
    HeaderComponent,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    BottomNavComponent,
  ],
  templateUrl: './acompanhamento.component.html',
  styleUrls: ['./acompanhamento.component.css'],
})
export class AcompanhamentoComponent implements OnInit, OnDestroy {
  pedido = signal<PedidoResponse | null>(null);
  loading = signal(true);
  error = signal(false);
  tempoEspera = signal('');
  showCancelDialog = signal(false);
  cancelando = signal(false);
  private pollingSub?: Subscription;
  private timerSub?: Subscription;

  private mensagensPreparando = [
    'Hambúrguer na chapa... 🔥',
    'Tá ficando bom! 👨‍🍳',
    'Já já fica pronto! ⏳',
    'Queijo derretendo... 🧀',
    'Preparando com carinho! ❤️',
    'Só mais um pouquinho... 🤏',
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pedidoService: PedidoService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    console.log('[Acompanhamento] ID do pedido:', id);
    if (id) {
      this.iniciarPolling(id);
    } else {
      this.error.set(true);
      this.loading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.pararPolling();
  }

  iniciarPolling(pedidoId: number): void {
    this.timerSub = timer(0, 30000).subscribe(() => this.atualizarTempoEspera());

    this.pollingSub = timer(0, environment.pollingIntervalMs)
      .pipe(
        switchMap(() => this.pedidoService.buscarPorId(pedidoId)),
        tap((pedido) => {
          const anterior = this.pedido();
          this.pedido.set(pedido);
          this.loading.set(false);
          this.atualizarTempoEspera();

          if (anterior?.status !== 'PRONTO' && pedido.status === 'PRONTO') {
            this.notificarPedidoPronto(pedido);
          }

          if (this.isFinalizado(pedido.status)) {
            this.pararPolling();
            if (pedido.status === 'CANCELADO') {
              this.authService.limparPedidoAtivo();
            }
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

  atualizarTempoEspera(): void {
    const p = this.pedido();
    if (!p || !p.dataHoraPedido) return;
    const inicio = new Date(p.dataHoraPedido).getTime();
    const agora = Date.now();
    const minutos = Math.floor((agora - inicio) / 60000);
    if (minutos < 1) this.tempoEspera.set('Agora mesmo');
    else if (minutos === 1) this.tempoEspera.set('1 minuto');
    else this.tempoEspera.set(`${minutos} minutos`);
  }

  notificarPedidoPronto(pedido: PedidoResponse): void {
    this.notificationService.tocarAlerta('pedido-pronto');
    this.notificationService.vibrar([300, 200, 300, 200, 500]);
    this.notificationService.notificarSistema(
      'Pedido Pronto! 🍔',
      `Pedido #${pedido.numero} está pronto. Dirija-se ao balcão.`
    );
  }

  pararPolling(): void {
    this.pollingSub?.unsubscribe();
    this.timerSub?.unsubscribe();
  }

  isFinalizado(status: StatusPedido): boolean {
    return status === 'PRONTO' || status === 'ENTREGUE' || status === 'CANCELADO';
  }

  adicionarItens(): void {
    this.router.navigate(['/cliente/cardapio'], {
      queryParams: { pedidoId: this.pedido()?.id }
    });
  }

  verDetalhes(): void {
    const id = this.pedido()?.id;
    if (id) this.router.navigate(['/cliente/pedido', id]);
  }

  abrirCancelDialog(): void {
    this.showCancelDialog.set(true);
  }

  fecharCancelDialog(): void {
    this.showCancelDialog.set(false);
  }

  confirmarCancelamento(): void {
    const id = this.pedido()?.id;
    if (!id) return;
    this.cancelando.set(true);
    this.pedidoService.cancelar(id).subscribe({
      next: (data) => {
        this.pedido.set(data);
        this.authService.limparPedidoAtivo();
        this.cancelando.set(false);
        this.showCancelDialog.set(false);
      },
      error: () => {
        this.cancelando.set(false);
        alert('Erro ao cancelar pedido.');
      },
    });
  }

  novoPedido(): void {
    this.authService.limparPedidoAtivo();
    this.router.navigate(['/cliente/cardapio']);
  }

  get statusIcon(): string {
    const icons: Record<StatusPedido, string> = {
      RECEBIDO: '📋', PREPARANDO: '🔥', PRONTO: '✅', ENTREGUE: '📦', CANCELADO: '❌',
    };
    return icons[this.pedido()?.status || 'RECEBIDO'];
  }

  get statusMensagem(): string {
    const msgs: Record<StatusPedido, string> = {
      RECEBIDO: 'Pedido recebido! Aguardando preparo...',
      PREPARANDO: this.mensagemAleatoria(),
      PRONTO: 'Pronto! Dirija-se ao balcão para retirar.',
      ENTREGUE: 'Pedido entregue. Bom apetite! 🍔',
      CANCELADO: 'Pedido cancelado.',
    };
    return msgs[this.pedido()?.status || 'RECEBIDO'];
  }

  private mensagemAleatoria(): string {
    return this.mensagensPreparando[Math.floor(Math.random() * this.mensagensPreparando.length)];
  }

  get progressoWidth(): number {
    switch (this.pedido()?.status) {
      case 'RECEBIDO': return 10;
      case 'PREPARANDO': return 50;
      case 'PRONTO': return 100;
      case 'ENTREGUE': return 100;
      default: return 0;
    }
  }

  get navItems(): NavItem[] {
    const pedidoId = this.pedido()?.id;
    const items: NavItem[] = [
      { label: 'Início', icon: 'home', route: '/cliente/home' },
      { label: 'Cardápio', icon: 'restaurant_menu', route: '/cliente/cardapio' },
    ];
    if (pedidoId) {
      items.push({
        label: 'Meu Pedido',
        icon: 'receipt_long',
        route: `/cliente/acompanhamento/${pedidoId}`,
        badge: 1,
      });
    }
    items.push({ label: 'Sair', icon: 'logout', route: '/cliente/login' });
    return items;
  }
}
