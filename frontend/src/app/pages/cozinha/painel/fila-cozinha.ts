import {
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  DestroyRef,
  ChangeDetectorRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';

import { FilaCozinhaResponse } from '../../../core/models/cozinha.model';
import { CaixaService } from '../../../core/services/caixa.service';
import { CozinhaService } from '../../../core/services/cozinha.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { ModalService } from '../../../core/services/modal.service';
import { AudioService } from '../../../core/services/audio.service';
import { WebsocketService } from '../../../core/services/websocket.service';

type StatusItem = 'PENDENTE' | 'PREPARANDO' | 'PRONTO';
type AbaCozinha = 'RECEBIDOS' | 'PREPARANDO' | 'PRONTOS';

@Component({
  selector: 'app-fila-cozinha',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './fila-cozinha.html',
  styleUrls: ['./fila-cozinha.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilaCozinhaComponent implements OnInit, OnDestroy {
  private readonly cozinhaService = inject(CozinhaService);
  private readonly caixaService = inject(CaixaService);
  private readonly pedidoService = inject(PedidoService);
  private readonly modalService = inject(ModalService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly audioService = inject(AudioService);
  private readonly notificationService = inject(NotificationService);
  private readonly websocketService = inject(WebsocketService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly filaPedidos = signal<FilaCozinhaResponse[]>([]);
  readonly somAtivado = signal(false);

  // ---> CONTROLE DE NAVEGAÇÃO DA TELA <---
  readonly abaAtiva = signal<AbaCozinha>('RECEBIDOS');

  // ====== Computed Principais ======
  readonly totalPedidos = computed(() => this.filaPedidos().length);

  readonly pedidosRecebidos = computed(() =>
    this.filaPedidos().filter((p) => p.status === 'RECEBIDO' || p.status === 'AGUARDANDO')
  );
  readonly pedidosEmPreparo = computed(() =>
    this.filaPedidos().filter((p) => p.status === 'PREPARANDO')
  );
  readonly pedidosProntos = computed(() =>
    this.filaPedidos().filter((p) => p.status === 'PRONTO')
  );

  private quantidadeAnterior = 0;
  private pedidosSubscription?: Subscription;

  ngOnInit(): void {
    this.carregarFila();
    this.pedidosSubscription = this.websocketService.pedidos$.subscribe(() => {
      this.carregarFila();
    });
  }

  ngOnDestroy(): void {
    this.pedidosSubscription?.unsubscribe();
  }

  alternarSom(): void {
    const novoEstado = !this.somAtivado();
    this.somAtivado.set(novoEstado);
    if (novoEstado) {
      this.audioService.desbloquear();
    }
  }

  private tocarSino(): void {
    if (!this.somAtivado()) return;
    this.audioService.tocarSino();
  }

  carregarFila(): void {
    this.cozinhaService
      .listarFila()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pedidos) => {
          this.processarFila(pedidos);
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Erro ao carregar fila', err),
      });
  }

  private processarFila(pedidos: FilaCozinhaResponse[]): void {
    const pedidosLimpos = pedidos
      .map((pedido) => ({
        ...pedido,
        itens: pedido.itens.filter((i) => i.status !== 'CANCELADO'),
      }))
      .filter((pedido) => pedido.itens.length > 0);

    const novaQtd = pedidosLimpos.length;
    if (novaQtd > this.quantidadeAnterior) {
      this.tocarSino();
    }

    this.quantidadeAnterior = novaQtd;
    this.filaPedidos.set(pedidosLimpos);
  }

  marcarItem(pedidoId: number, itemId: number, statusAtual: string): void {
    const proximo = this.proximoStatus(statusAtual);
    this.atualizarItemLocal(pedidoId, itemId, proximo);

    // ---> MÁGICA: A tela acompanha o cozinheiro! <---
    if (proximo === 'PREPARANDO' && this.abaAtiva() === 'RECEBIDOS') {
      this.abaAtiva.set('PREPARANDO');
    }

    this.cozinhaService
      .atualizarStatusItem(pedidoId, itemId, proximo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {},
        error: (err) => {
          let mensagemDoBackend = 'Não foi possível atualizar o status. Tente novamente.';
          if (err.error) {
            try {
              const erroFormatado = typeof err.error === 'string' ? JSON.parse(err.error) : err.error;
              if (erroFormatado?.mensagem) mensagemDoBackend = erroFormatado.mensagem;
              else if (erroFormatado?.message) mensagemDoBackend = erroFormatado.message;
              else if (typeof err.error === 'string') mensagemDoBackend = err.error;
            } catch (e) {
              console.error('Falha ao ler o erro', e);
            }
          }
          this.notificationService.erro('Ação Bloqueada', mensagemDoBackend);
          this.atualizarItemLocal(pedidoId, itemId, statusAtual as any);
        },
      });
  }

  private proximoStatus(atual: string): StatusItem {
    if (atual === 'PENDENTE') return 'PREPARANDO';
    if (atual === 'PREPARANDO') return 'PRONTO';
    return 'PENDENTE';
  }

  private atualizarItemLocal(pedidoId: number, itemId: number, novoStatus: StatusItem): void {
    this.filaPedidos.update((fila) =>
      fila.map((pedido) => {
        if (pedido.pedidoId !== pedidoId && pedido.id !== pedidoId) return pedido;

        const itensAtualizados = pedido.itens.map((item) =>
          item.itemId === itemId ? { ...item, status: novoStatus } : item,
        );
        const todosProntos = itensAtualizados.every((i) => i.status === 'PRONTO');
        const statusPedido = todosProntos ? 'PRONTO' : 'PREPARANDO';

        return {
          ...pedido,
          itens: itensAtualizados,
          status: statusPedido,
        };
      }),
    );
  }

  temHamburguer(pedido: FilaCozinhaResponse): boolean {
    return pedido.itens.some((i) => i.categoria === 'HAMBURGUER' || i.categoria === 'Hamburguer');
  }

  cancelarPedido(pedidoId: number): void {
    this.modalService.abrir({
      titulo: 'Cancelar pedido?',
      mensagem: 'Ele irá para o arquivo morto e não será cobrado.',
      tipo: 'perigo',
      textoConfirmar: 'Sim, cancelar',
      textoCancelar: 'Voltar',
      onConfirm: () => this.executarCancelamento(pedidoId),
    });
  }

  cancelarItem(pedidoId: number, item: any): void {
    this.modalService.abrir({
      titulo: 'Cancelar este Lanche?',
      mensagem: `Tem certeza que deseja remover "${item.quantidade}x ${item.nomeProduto}"? O valor será descontado da conta do cliente e o estoque devolvido.`,
      tipo: 'perigo',
      textoConfirmar: 'Sim, remover',
      textoCancelar: 'Voltar',
      onConfirm: () => this.executarCancelamentoItem(pedidoId, item.itemId),
    });
  }

  private executarCancelamentoItem(pedidoId: number, itemId: number): void {
    this.cozinhaService
      .atualizarStatusItem(pedidoId, itemId, 'CANCELADO')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notificationService.sucesso('Item Removido', 'Lanche cancelado com sucesso.');
          this.filaPedidos.update((fila) =>
            fila
              .map((pedido) => {
                if (pedido.pedidoId !== pedidoId && pedido.id !== pedidoId) return pedido;
                const novosItens = pedido.itens.filter((i) => i.itemId !== itemId);
                return { ...pedido, itens: novosItens };
              })
              .filter((pedido) => pedido.itens.length > 0),
          );
        },
        error: () => this.notificationService.erro('Erro', 'Não foi possível cancelar o item.'),
      });
  }

  private executarCancelamento(pedidoId: number): void {
    this.pedidoService
      .cancelarPedido(pedidoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notificationService.sucesso('Cancelado', 'Pedido enviado para o arquivo morto.');
          this.filaPedidos.update((fila) => fila.filter((p) => p.pedidoId !== pedidoId && p.id !== pedidoId));
        },
        error: () => this.notificationService.erro('Erro', 'Não foi possível cancelar o pedido.'),
      });
  }

  readonly exibirModalQrCode = signal<boolean>(false);
  readonly linkCardapio = window.location.origin + '/';
  get urlQrCodeApi(): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(this.linkCardapio)}`;
  }
}
