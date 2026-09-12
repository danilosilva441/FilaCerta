import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { FilaCozinhaResponse } from '../../../core/models/cozinha.model';
import { CaixaService } from '../../../core/services/caixa.service';
import { CozinhaService } from '../../../core/services/cozinha.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PedidoService } from '../../../core/services/pedido.service';

@Component({
  selector: 'app-fila-cozinha',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fila-cozinha.html',
})
export class FilaCozinhaComponent implements OnInit, OnDestroy {
  filaPedidos: FilaCozinhaResponse[] = [];
  private pollingSubscription?: Subscription;

  somAtivado = false;
  quantidadePedidosAnteriores = 0;
  audio = new Audio('assets/audios/sino.mp3');

  constructor(
    private cozinhaService: CozinhaService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
    private caixaService: CaixaService,
    private pedidoService: PedidoService,
  ) {}

  ngOnInit(): void {
    // 1. Carrega imediatamente a primeira vez
    this.carregarFila();
    // 2. Inicia o loop automático de 5 em 5 segundos
    this.iniciarPolling();
  }

  // Método para o chapeiro ligar/desligar o som
  alternarSom(): void {
    this.somAtivado = !this.somAtivado;

    if (this.somAtivado) {
      // Macete: Tocamos e pausamos bem rápido só para o Chrome
      // registrar que o usuário interagiu e liberar o áudio pro futuro!
      this.audio.play().catch(() => console.log('Áudio bloqueado'));
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  }

  tocarSino(): void {
    if (this.somAtivado) {
      this.audio.currentTime = 0; // Volta o som pro começo
      this.audio.play().catch((err) => console.error('Erro ao tocar áudio', err));
    }
  }

  // NOVA FUNÇÃO: Busca os pedidos e atualiza a tela apenas UMA VEZ
  carregarFila(): void {
    this.cozinhaService.listarFila().subscribe({
      next: (pedidos) => {
        // Quantos pedidos temos AGORA nessa lista nova que chegou?
        const novaQuantidade = pedidos.length;

        // Se a quantidade nova for MAIOR que a antiga, significa que chegou pedido novo!
        if (novaQuantidade > this.quantidadePedidosAnteriores) {
          this.tocarSino();
        }

        // Atualiza a variável para a próxima checagem
        this.quantidadePedidosAnteriores = novaQuantidade;
        this.filaPedidos = pedidos;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao carregar fila', err),
    });
  }

  iniciarPolling(): void {
    this.pollingSubscription = timer(5000, 5000) // Espera 5s e depois roda a cada 5s
      .pipe(
        switchMap(() => this.cozinhaService.listarFila()),
        tap((pedidos) => {
          // Toca alarme se a fila cresceu (chegou pedido novo)
          if (pedidos.length > this.filaPedidos.length && this.filaPedidos.length > 0) {
            this.tocarSino();
          }
          this.filaPedidos = pedidos;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        error: (err) => console.error('Erro no polling da cozinha', err),
      });
  }

  marcarItem(pedidoId: number, itemId: number, statusAtual: string): void {
    let novoStatus = 'PREPARANDO';

    // Lógica do Checklist: PENDENTE -> PREPARANDO -> PRONTO -> PENDENTE (desmarcar)
    if (statusAtual === 'PENDENTE') novoStatus = 'PREPARANDO';
    else if (statusAtual === 'PREPARANDO') novoStatus = 'PRONTO';
    else if (statusAtual === 'PRONTO') novoStatus = 'PENDENTE';

    // 1. Atualização Otimista (Muda na tela antes mesmo do servidor responder para parecer instantâneo)
    this.atualizarItemLocal(pedidoId, itemId, novoStatus);

    // 2. Manda pro Backend
    this.cozinhaService.atualizarStatusItem(pedidoId, itemId, novoStatus).subscribe({
      next: () => {
        // Se deu sucesso, não faz nada, a tela já atualizou
      },
      error: () => {
        // Se deu erro, reverte a tela para o status antigo
        this.notificationService.erro(
          'Erro ao atualizar item',
          'Não foi possível atualizar o status do item. Tente novamente.',
        );
        this.atualizarItemLocal(pedidoId, itemId, statusAtual);
      },
    });
  }

  private atualizarItemLocal(pedidoId: number, itemId: number, novoStatus: string): void {
    const pedido = this.filaPedidos.find((p) => p.pedidoId === pedidoId);
    if (pedido) {
      const item = pedido.itens.find((i) => i.itemId === itemId);
      if (item) {
        item.status = novoStatus as 'PENDENTE' | 'PREPARANDO' | 'PRONTO';

        // Verifica se TODOS os itens do pedido agora estão prontos (para atualizar o botão verde na hora)
        const todosProntos = pedido.itens.every((i) => i.status === 'PRONTO');
        if (todosProntos) {
          pedido.status = 'PRONTO';
        } else {
          // Se ele desmarcou algo, volta para PREPARANDO (ou RECEBIDO)
          pedido.status = 'PREPARANDO';
        }
      }
    }
    this.cdr.detectChanges();
  }

  temHamburguer(pedido: FilaCozinhaResponse): boolean {
    return pedido.itens.some((i) => i.categoria === 'HAMBURGUER');
  }

  isPedidoPronto(pedido: FilaCozinhaResponse): boolean {
    if (!pedido.itens || pedido.itens.length === 0) return false;
    // Retorna TRUE apenas se TODOS os itens estiverem com status PRONTO
    return pedido.itens.every((i) => i.status === 'PRONTO');
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  entregarPedido(pedidoId: number): void {
    if (!confirm('O lanche foi entregue e o cliente já pagou?')) return;

    this.caixaService.finalizarEntrega(pedidoId).subscribe({
      next: () => {
        this.notificationService.sucesso('Sucesso!', 'Pedido entregue e pago.');

        // Remove da tela instantaneamente sem precisar esperar os 5 segundos do Polling
        this.filaPedidos = this.filaPedidos.filter((p) => p.pedidoId !== pedidoId);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error(err);
        this.notificationService.erro('Erro', 'Não foi possível finalizar o pedido.');
      },
    });
  }
  // ... importe o ModalService e NotificationService se não tiver
  cancelarPedido(pedidoId: number): void {
    if (
      confirm(
        'Tem certeza que deseja CANCELAR este pedido? Ele irá para o arquivo morto e não será cobrado.',
      )
    ) {
      this.pedidoService.cancelarPedido(pedidoId).subscribe({
        next: () => {
          this.notificationService.sucesso('Cancelado', 'Pedido enviado para o arquivo morto.');
          this.carregarFila(); // Atualiza a tela para o pedido sumir
        },
        error: () => this.notificationService.erro('Erro', 'Não foi possível cancelar o pedido.'),
      });
    }
  }
  testarSom(): void {
    this.notificationService.tocarSino();
  }
}
