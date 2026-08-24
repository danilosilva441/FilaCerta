import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, timer } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { CozinhaService } from '../../../core/services/cozinha.service';
import { FilaCozinhaResponse } from '../../../core/models/cozinha.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-painel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './painel.html',
})
export class PainelComponent implements OnInit, OnDestroy {
  filaPedidos: FilaCozinhaResponse[] = [];
  private pollingSubscription?: Subscription;

  constructor(
    private cozinhaService: CozinhaService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.iniciarPolling();
  }

  iniciarPolling(): void {
    this.pollingSubscription = timer(0, 5000)
      .pipe(
        switchMap(() => this.cozinhaService.listarFila()),
        tap((pedidos) => {
          // Toca alarme se a fila cresceu (chegou pedido novo)
          if (pedidos.length > this.filaPedidos.length && this.filaPedidos.length > 0) {
            this.tocarAlertaNovoPedido();
          }
          this.filaPedidos = pedidos;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        error: (err) => console.error('Erro no polling da cozinha', err),
      });
  }

  tocarAlertaNovoPedido(): void {
    try {
      const audio = new Audio('assets/sounds/notification.mp3');
      audio.play().catch(() => {});
    } catch (e) {}
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
      }
    }
    this.cdr.detectChanges();
  }

  temHamburguer(pedido: FilaCozinhaResponse): boolean {
    return pedido.itens.some((i) => i.categoria === 'HAMBURGUER');
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }
}
