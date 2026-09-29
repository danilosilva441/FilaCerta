import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, Subscription } from 'rxjs';

import { PedidoResponse } from '../../../core/models/pedido.model';
import { AudioService } from '../../../core/services/audio.service';
import { ModalService } from '../../../core/services/modal.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { WebsocketService } from '../../../core/services/websocket.service';

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
  // ====== Injeções ======
  private readonly route = inject(ActivatedRoute);
  private readonly pedidoService = inject(PedidoService);
  private readonly modalService = inject(ModalService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly audioService = inject(AudioService);
  private readonly websocketService = inject(WebsocketService);
  private readonly cdr = inject(ChangeDetectorRef); // <-- ADICIONADO AQUI

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
  private pedidoSubscription?: Subscription;

  // ====== Lifecycle ======
  ngOnInit(): void {
    // Pegue o ID do pedido da URL (como você já deve estar fazendo)
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {
      this.pedidoId = id;

      // 1. Busca o status atualizado do pedido assim que a tela abre
      this.carregarPedido();

      // 2. Fica na escuta: Toda vez que a cozinha ou o caixa mexerem em QUALQUER pedido,
      // o rádio toca e nós recarregamos os dados deste pedido instantaneamente.
      this.pedidoSubscription = this.websocketService.pedidos$.subscribe(() => {
        this.carregarPedido();
      });
    }
  }

  carregarPedido(): void {
    // 1. Resolve o erro de "number | null"
    if (!this.pedidoId) return;

    this.pedidoService.buscarPorId(this.pedidoId).subscribe({
      next: (pedido) => {
        // 2. Resolve o erro de Signal Read-Only usando a sua função já pronta!
        this.processarAtualizacao(pedido);

        // 3. O cdr agora existe e funciona perfeitamente
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao atualizar pedido:', err),
    });
  }

  ngOnDestroy(): void {
    // Não esqueça de desligar o rádio quando o cliente fechar a tela!
    this.pedidoSubscription?.unsubscribe();
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
