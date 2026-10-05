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

import { FilaCozinhaResponse } from '../../../core/models/cozinha.model';
import { CaixaService } from '../../../core/services/caixa.service';
import { CozinhaService } from '../../../core/services/cozinha.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { ModalService } from '../../../core/services/modal.service';
import { AudioService } from '../../../core/services/audio.service';
import { WebsocketService } from '../../../core/services/websocket.service';

type StatusItem = 'PENDENTE' | 'PREPARANDO' | 'PRONTO';

@Component({
  selector: 'app-fila-cozinha',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fila-cozinha.html',
  styleUrls: ['./fila-cozinha.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilaCozinhaComponent implements OnInit, OnDestroy {
  // ====== Injeções ======
  private readonly cozinhaService = inject(CozinhaService);
  private readonly caixaService = inject(CaixaService);
  private readonly pedidoService = inject(PedidoService);
  private readonly modalService = inject(ModalService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly audioService = inject(AudioService);
  private readonly notificationService = inject(NotificationService);
  private readonly websocketService = inject(WebsocketService);
  private readonly cdr = inject(ChangeDetectorRef);

  // ====== Signals ======
  readonly filaPedidos = signal<FilaCozinhaResponse[]>([]);
  readonly somAtivado = signal(false);

  // ====== Computed ======
  readonly totalPedidos = computed(() => this.filaPedidos().length);

  // ====== Controle interno ======
  private quantidadeAnterior = 0;
  private pedidosSubscription?: Subscription;

  // ====== Lifecycle ======
  ngOnInit(): void {
    // 1. Busca inicial ao abrir a tela
    this.carregarFila();

    // 2. Sintoniza no rádio: Atualiza imediatamente quando o Java avisar
    this.pedidosSubscription = this.websocketService.pedidos$.subscribe(() => {
      this.carregarFila();
    });
  }

  ngOnDestroy(): void {
    // Desliga a antena ao sair da página
    this.pedidosSubscription?.unsubscribe();
  }

  // ====== Som ======
  alternarSom(): void {
    const novoEstado = !this.somAtivado();
    this.somAtivado.set(novoEstado);

    if (novoEstado) {
      this.audioService.desbloquear();
    }
  }

  testarSom(): void {
    this.audioService.tocarSino();
  }

  private tocarSino(): void {
    if (!this.somAtivado()) return;
    this.audioService.tocarSino();
  }

  // ====== Carregamento ======
  carregarFila(): void {
    this.cozinhaService
      .listarFila()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pedidos) => {
          this.processarFila(pedidos);
          this.cdr.detectChanges(); // Força a tela a desenhar na hora!
        },
        error: (err) => console.error('Erro ao carregar fila', err),
      });
  }

  private processarFila(pedidos: FilaCozinhaResponse[]): void {
    const novaQtd = pedidos.length;

    // Toca sino se a fila AUMENTOU (chegou pedido novo)
    if (novaQtd > this.quantidadeAnterior) {
      this.tocarSino();
    }

    this.quantidadeAnterior = novaQtd;
    this.filaPedidos.set(pedidos);
  }

  // ====== Ações nos itens ======
  marcarItem(pedidoId: number, itemId: number, statusAtual: string): void {
    const proximo = this.proximoStatus(statusAtual);

    // Atualização otimista (UI muda na hora, sem esperar o Java)
    this.atualizarItemLocal(pedidoId, itemId, proximo);

    this.cozinhaService
      .atualizarStatusItem(pedidoId, itemId, proximo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          // Já atualizou, o WebSocket vai mandar a versão oficial em instantes
        },
        error: () => {
          this.notificationService.erro(
            'Erro ao atualizar item',
            'Não foi possível atualizar o status. Tente novamente.',
          );
          // Reverte se deu erro
          this.atualizarItemLocal(pedidoId, itemId, statusAtual as StatusItem);
        },
      });
  }

  private proximoStatus(atual: string): StatusItem {
    if (atual === 'PENDENTE') return 'PREPARANDO';
    if (atual === 'PREPARANDO') return 'PRONTO';
    return 'PENDENTE';
  }

  /**
   * Atualiza imutavelmente — cria nova referência para o signal disparar.
   */
  private atualizarItemLocal(pedidoId: number, itemId: number, novoStatus: StatusItem): void {
    this.filaPedidos.update((fila) =>
      fila.map((pedido) => {
        if (pedido.pedidoId !== pedidoId) return pedido;

        const itensAtualizados = pedido.itens.map((item) =>
          item.itemId === itemId ? { ...item, status: novoStatus } : item,
        );

        const todosProntos = itensAtualizados.every((i) => i.status === 'PRONTO');

        return {
          ...pedido,
          itens: itensAtualizados,
          status: todosProntos ? 'PRONTO' : 'PREPARANDO',
        };
      }),
    );
  }

  // ====== Helpers ======
  temHamburguer(pedido: FilaCozinhaResponse): boolean {
    return pedido.itens.some((i) => i.categoria === 'HAMBURGUER');
  }

  isPedidoPronto(pedido: FilaCozinhaResponse): boolean {
    if (!pedido.itens?.length) return false;
    return pedido.itens.every((i) => i.status === 'PRONTO');
  }

  // ====== Entrega ======
  entregarPedido(pedidoId: number): void {
    this.modalService.abrir({
      titulo: 'Entregar pedido?',
      mensagem: 'Confirme que o lanche foi entregue e o cliente já pagou.',
      tipo: 'sucesso',
      textoConfirmar: 'Sim, entregar',
      textoCancelar: 'Voltar',
      onConfirm: () => this.executarEntrega(pedidoId),
    });
  }

  private executarEntrega(pedidoId: number): void {
    this.caixaService
      .finalizarEntrega(pedidoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notificationService.sucesso('Sucesso!', 'Pedido entregue e pago.');
          // Remove da tela imediatamente
          this.filaPedidos.update((fila) => fila.filter((p) => p.pedidoId !== pedidoId));
        },
        error: () => {
          this.notificationService.erro('Erro', 'Não foi possível finalizar o pedido.');
        },
      });
  }

  // ====== Cancelamento ======
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

  private executarCancelamento(pedidoId: number): void {
    this.pedidoService
      .cancelarPedido(pedidoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notificationService.sucesso('Cancelado', 'Pedido enviado para o arquivo morto.');
          this.filaPedidos.update((fila) => fila.filter((p) => p.pedidoId !== pedidoId));
        },
        error: () => {
          this.notificationService.erro('Erro', 'Não foi possível cancelar o pedido.');
        },
      });
  }

  // Controla a visibilidade do modal do QR Code
  readonly exibirModalQrCode = signal<boolean>(false);

  // Pega o endereço atual do cliente (funciona tanto no localhost quanto no IP da rede do celular)
  readonly linkCardapio = window.location.origin + '/';

  // URL geradora de QR Code instantânea
  get urlQrCodeApi(): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(this.linkCardapio)}`;
  }
}
