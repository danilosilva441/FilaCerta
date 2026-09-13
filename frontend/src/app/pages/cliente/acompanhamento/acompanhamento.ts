import {
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  EMPTY,
  Observable,
  Subject,
  catchError,
  fromEvent,
  interval,
  map,
  startWith,
  switchMap,
  takeWhile,
  tap,
  timeout,
} from 'rxjs';

import { PedidoResponse } from '../../../core/models/pedido.model';
import { PedidoService } from '../../../core/services/pedido.service';
import { ModalService } from '../../../core/services/modal.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AudioService } from '../../../core/services/audio.service';

const MENSAGENS: Record<string, string> = {
  RECEBIDO: 'Pedido recebido! Aguardando preparo...',
  PREPARANDO: 'A chapa tá quente! Seu pedido está sendo preparado.',
  PRONTO: '✅ Seu pedido está PRONTO! Pode retirar no balcão.',
  SERVIDO: '🍽️ Pedido na mesa! Bom apetite.',
  ENTREGUE: 'Pedido entregue. Bom apetite! 🍔',
  CANCELADO: 'Pedido cancelado.',
};

const STATUS_FINAIS = ['CANCELADO', 'ENTREGUE'] as const;
const INTERVALO_POLLING = 5000;
const TIMEOUT_REQ = 5000;

@Component({
  selector: 'app-acompanhamento',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './acompanhamento.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcompanhamentoComponent implements OnInit, OnDestroy {
  // ====== Injeções ======
  private readonly route = inject(ActivatedRoute);
  private readonly pedidoService = inject(PedidoService);
  private readonly modalService = inject(ModalService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly audioService = inject(AudioService);

  // ====== Signals ======
  readonly pedido = signal<PedidoResponse | null>(null);
  readonly statusMensagem = signal('Carregando pedido...');
  readonly erroRede = signal(false);

  // ====== Computed ======
  readonly isFinalizado = computed(() => {
    const status = this.pedido()?.status;
    return status === 'CANCELADO' || status === 'ENTREGUE' || status === 'SERVIDO';
  });

  readonly isCancelado = computed(() => this.pedido()?.status === 'CANCELADO');

  readonly podeCancelar = computed(() => {
    const status = this.pedido()?.status;
    return status === 'AGUARDANDO' || status === 'RECEBIDO';
  });

  readonly mostrarNovoPedido = computed(() => {
    const status = this.pedido()?.status;
    return status === 'ENTREGUE' || status === 'SERVIDO' || status === 'CANCELADO';
  });

  // ====== Controle interno ======
  private pedidoId: number | null = null;
  private readonly visibilidade$ = new Subject<boolean>();

  // ====== Lifecycle ======
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      console.error('ID do pedido não encontrado na URL');
      this.notificationService.erro(
        'Pedido não encontrado',
        'Volte ao cardápio e tente novamente.',
      );
      return;
    }

    this.pedidoId = Number(id);
    this.iniciarMonitoramento(this.pedidoId);
  }

  ngOnDestroy(): void {
    this.visibilidade$.complete();
  }

  // ====== Polling inteligente ======
  private iniciarMonitoramento(pedidoId: number): void {
    // Combina polling com visibilidade da aba
    fromEvent(document, 'visibilitychange')
      .pipe(
        map(() => document.visibilityState === 'visible'),
        startWith(true),
        takeUntilDestroyed(this.destroyRef),
        switchMap((visivel) => (visivel ? this.criarPolling(pedidoId) : EMPTY)),
      )
      .subscribe();
  }

  private criarPolling(pedidoId: number): Observable<PedidoResponse> {
    return interval(INTERVALO_POLLING).pipe(
      startWith(0),
      switchMap(() =>
        this.pedidoService.buscarPorId(pedidoId).pipe(
          timeout(TIMEOUT_REQ),
          catchError((err) => {
            console.error('Erro no polling do pedido', err);
            this.erroRede.set(true);
            return EMPTY;
          }),
        ),
      ),
      // Para o polling quando atinge estado final
      takeWhile((p) => !this.isStatusFinal(p.status), true),
      tap((p) => this.processarAtualizacao(p)),
    );
  }

  private isStatusFinal(status: string): boolean {
    return (STATUS_FINAIS as readonly string[]).includes(status);
  }

  // ====== Processamento de updates ======
  private processarAtualizacao(pedido: PedidoResponse): void {
    const anterior = this.pedido();

    this.erroRede.set(false);
    this.pedido.set(pedido);
    this.statusMensagem.set(MENSAGENS[pedido.status] ?? 'Aguarde...');

    // Pagamento acabou de ser confirmado
    if (anterior?.statusPagamento === 'AGUARDANDO' && pedido.statusPagamento === 'PAGO') {
      console.log('💰 Pagamento confirmado pelo caixa!');
      this.tocarAlerta();
    }

    // Pedido ficou pronto
    if (anterior?.status !== 'PRONTO' && pedido.status === 'PRONTO') {
      this.tocarAlerta();
    }

    // Pedido ficou servido (mesa)
    if (anterior?.status !== 'SERVIDO' && pedido.status === 'SERVIDO') {
      this.tocarAlerta();
    }
  }

  // ====== Alerta (som + vibração) ======
  private tocarAlerta(): void {
    this.audioService.tocarSino();
  }

  // ====== Cancelamento ======
  cancelarPedidoPeloCliente(): void {
    const pedido = this.pedido();
    if (!pedido) return;

    this.modalService.abrir({
      titulo: 'Cancelar pedido?',
      mensagem: 'Se a cozinha já começou o preparo, o cancelamento pode não ser aceito.',
      tipo: 'perigo',
      textoConfirmar: 'Sim, cancelar',
      textoCancelar: 'Manter pedido',
      onConfirm: () => this.executarCancelamento(pedido.id),
    });
  }

  private executarCancelamento(pedidoId: number): void {
    this.pedidoService
      .cancelarPedido(pedidoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const pedidoAtual = this.pedido();
          if (pedidoAtual) {
            const atualizado = { ...pedidoAtual, status: 'CANCELADO' };
            this.pedido.set(atualizado);
            this.statusMensagem.set(MENSAGENS['CANCELADO']);
          }
          this.notificationService.info('Pedido cancelado', 'Esperamos você na próxima!');
        },
        error: () => {
          this.notificationService.erro(
            'Não foi possível cancelar',
            'A cozinha pode já ter iniciado o preparo.',
          );
        },
      });
  }

  // ====== Helpers pro template ======
  getIconeStatus(status: string): string {
    const mapa: Record<string, string> = {
      RECEBIDO: '📋',
      PREPARANDO: '🔥',
      PRONTO: '✅',
      SERVIDO: '🍽️',
      ENTREGUE: '🛍️',
      CANCELADO: '❌',
    };
    return mapa[status] ?? '⏳';
  }

  getCorCirculo(status: string): string {
    const mapa: Record<string, string> = {
      RECEBIDO: 'bg-yellow-100 text-yellow-600',
      PREPARANDO: 'bg-orange-100 text-orange-600 animate-bounce',
      PRONTO: 'bg-green-100 text-green-600 scale-110 shadow-green-200',
      SERVIDO: 'bg-green-100 text-green-600 scale-110 shadow-green-200',
      ENTREGUE: 'bg-blue-100 text-blue-600',
      CANCELADO: 'bg-red-100 text-red-600',
    };
    return mapa[status] ?? 'bg-gray-100 text-gray-500';
  }
}
