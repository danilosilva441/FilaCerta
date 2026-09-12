import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { PedidoResponse } from '../../../core/models/pedido.model';
import { PedidoService } from '../../../core/services/pedido.service';

@Component({
  selector: 'app-acompanhamento',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './acompanhamento.html',
})
export class AcompanhamentoComponent implements OnInit, OnDestroy {
  pedido: PedidoResponse | null = null;
  statusMensagem = 'Carregando pedido...';
  private pollingSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private pedidoService: PedidoService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Pega o ID do pedido que veio na URL
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.iniciarPolling(+id);
    }
  }

  iniciarPolling(pedidoId: number): void {
    this.pollingSubscription = timer(0, 5000)
      .pipe(
        switchMap(() => this.pedidoService.buscarPorId(pedidoId)),
        tap((pedido) => {
          const statusAnterior = this.pedido?.status;
          const statusPagamentoAnterior = this.pedido?.statusPagamento;

          this.pedido = pedido;
          this.atualizarMensagem(pedido);

          // Avisa se o pagamento foi confirmado
          if (statusPagamentoAnterior === 'AGUARDANDO' && pedido.statusPagamento === 'PAGO') {
            console.log('✅ Pagamento confirmado pelo caixa!');
          }

          // Se mudou para PRONTO, toca o alarme MAS CONTINUA ESCUTANDO!
          if (statusAnterior !== 'PRONTO' && pedido.status === 'PRONTO') {
            this.tocarAlerta();

            // ❌ APAGAMOS o this.pararPolling() que ficava aqui!
            // Deixe o radar ligado para ele perceber quando o caixa marcar como PAGO.
          } else if (pedido.status === 'CANCELADO' || pedido.status === 'ENTREGUE') {
            // ✅ Aqui sim! O pedido chegou ao fim da vida. Podemos desligar o radar.
            this.pararPolling();
          }

          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        error: (err) => console.error('Erro no polling do pedido', err),
      });
  }

  atualizarMensagem(pedido: PedidoResponse): void {
    const mensagens: Record<string, string> = {
      RECEBIDO: 'Pedido recebido! Aguardando preparo...',
      PREPARANDO: 'A chapa tá quente! Seu pedido está sendo preparado.',
      PRONTO: '✅ Seu pedido está PRONTO! Pode retirar no balcão.',
      ENTREGUE: 'Pedido entregue. Bom apetite! 🍔',
      CANCELADO: 'Pedido cancelado.',
    };
    this.statusMensagem = mensagens[pedido.status] || 'Aguarde...';
  }

  tocarAlerta(): void {
    try {
      const audio = new Audio('assets/sounds/notification.mp3');
      audio.play().catch((e) => console.log('O navegador bloqueou o áudio automático', e));

      // Fallback: Vibra o celular se estiver num Android
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    } catch (e) {
      console.error('Erro ao tocar alarme', e);
    }
  }

  pararPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  // Boa prática: sempre desligar o loop quando sair da tela
  ngOnDestroy(): void {
    this.pararPolling();
  }

  cancelarPedidoPeloCliente(): void {
    if (!this.pedido) return;

    if (confirm('Poxa, tem certeza que deseja cancelar seu pedido?')) {
      this.pedidoService.cancelarPedido(this.pedido.id).subscribe({
        next: () => {
          this.pedido!.status = 'CANCELADO';
          this.atualizarMensagem(this.pedido!); // Atualiza o texto na tela
          this.pararPolling(); // Para de perguntar ao servidor a cada 5s
          this.cdr.detectChanges();
        },
        error: () => alert('Erro ao cancelar. Talvez a cozinha já tenha começado!'),
      });
    }
  }
}
