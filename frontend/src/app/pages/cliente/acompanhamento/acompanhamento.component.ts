import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription, timer, switchMap, tap } from 'rxjs';
import { PedidoService } from '../../../core/services/pedido.service';
import { NotificationService } from '../../../core/services/notification.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
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
  ],
  templateUrl: './acompanhamento.component.html',
  styleUrls: ['./acompanhamento.component.css'],
})
export class AcompanhamentoComponent implements OnInit, OnDestroy {
  pedido = signal<PedidoResponse | null>(null);
  loading = signal(true);
  error = signal(false);
  tempoEspera = signal('');
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
    private pedidoService: PedidoService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
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
    this.timerSub = timer(0, 30000).subscribe(() => {
      this.atualizarTempoEspera();
    });

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

    if (minutos < 1) {
      this.tempoEspera.set('Agora mesmo');
    } else if (minutos === 1) {
      this.tempoEspera.set('1 minuto');
    } else {
      this.tempoEspera.set(`${minutos} minutos`);
    }
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
      PREPARANDO: this.mensagemAleatoria(),
      PRONTO: 'Pronto! Dirija-se ao balcão para retirar.',
      ENTREGUE: 'Pedido entregue. Bom apetite! 🍔',
      CANCELADO: 'Pedido cancelado.',
    };
    return msgs[this.pedido()?.status || 'RECEBIDO'];
  }

  private mensagemAleatoria(): string {
    const indice = Math.floor(Math.random() * this.mensagensPreparando.length);
    return this.mensagensPreparando[indice];
  }

  get progressoWidth(): number {
    const status = this.pedido()?.status;
    switch (status) {
      case 'RECEBIDO': return 10;
      case 'PREPARANDO': return 50;
      case 'PRONTO': return 100;
      case 'ENTREGUE': return 100;
      default: return 0;
    }
  }
}
