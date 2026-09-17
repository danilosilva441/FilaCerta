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
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, interval, startWith, switchMap } from 'rxjs';

import { CaixaDiarioResponse } from '../../../core/models/caixa-diario.model';
import { CaixaService } from '../../../core/services/caixa.service';
// ---> INCLUSÃO DO PEDIDO SERVICE <---
import { PedidoService } from '../../../core/services/pedido.service';
import { ModalService } from '../../../core/services/modal.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PedidoResponse } from '../../../core/models/pedido.model';

interface ResumoCaixa {
  faturamentoTotal: number;
  totalPix: number;
  totalCartao: number;
  totalDinheiro: number;
  totalEmGaveta: number;
  valorInicialTroco: number;
}

type EstadoTela = 'CARREGANDO' | 'FECHADO' | 'ABERTO';

@Component({
  selector: 'app-painel-caixa',
  standalone: true,
  imports: [CommonModule, DecimalPipe, FormsModule],
  templateUrl: './painel-caixa.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PainelCaixaComponent implements OnInit, OnDestroy {
  private readonly caixaService = inject(CaixaService);
  private readonly pedidoService = inject(PedidoService); // <-- INJETADO AQUI
  private readonly notificationService = inject(NotificationService);
  private readonly modalService = inject(ModalService);
  private readonly destroyRef = inject(DestroyRef);

  // ====== Signals ======
  readonly caixaAtual = signal<CaixaDiarioResponse | null>(null);
  readonly resumoAtual = signal<ResumoCaixa | null>(null);
  readonly resumoFechamento = signal<ResumoCaixa | null>(null);
  readonly estadoTela = signal<EstadoTela>('CARREGANDO');
  readonly pedidosBalcao = signal<PedidoResponse[]>([]);
  readonly valorAbertura = signal<number>(0);
  readonly isProcessando = signal<boolean>(false);

  // ====== Computed ======
  readonly isAberto = computed(() => this.estadoTela() === 'ABERTO');
  readonly isPausado = computed(() => this.caixaAtual()?.cozinhaPausada === true);

  // ====== Timer ======
  private intervalId: ReturnType<typeof setInterval> | null = null;

  // ====== Lifecycle ======
  ngOnInit(): void {
    this.verificarCaixa();
  }

  ngOnDestroy(): void {
    this.pararMonitoramentoResumo();
  }

  // ====== Caixa ======
  verificarCaixa(): void {
    this.estadoTela.set('CARREGANDO');

    this.caixaService
      .buscarCaixaAtual()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (caixa) => {
          if (caixa?.status === 'ABERTO') {
            this.caixaAtual.set(caixa);
            this.estadoTela.set('ABERTO');
            this.iniciarMonitoramentoResumo();
          } else {
            this.limparEstadoFechado();
          }
        },
        error: (err) => {
          console.error('Erro ao buscar status do caixa', err);
          this.limparEstadoFechado();
        },
      });
  }

  private limparEstadoFechado(): void {
    this.caixaAtual.set(null);
    this.resumoAtual.set(null);
    this.pedidosBalcao.set([]);
    this.estadoTela.set('FECHADO');
    this.pararMonitoramentoResumo();
  }

  abrirCaixa(): void {
    const valor = Number(this.valorAbertura()) || 0;

    if (valor < 0) {
      this.notificationService.erro(
        'Valor inválido',
        'O valor de abertura do caixa não pode ser negativo.',
      );
      return;
    }

    if (this.isProcessando()) return;

    this.isProcessando.set(true);

    this.caixaService
      .abrirCaixa({ valorInicial: valor })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isProcessando.set(false)),
      )
      .subscribe({
        next: (caixa) => {
          this.caixaAtual.set(caixa);
          this.estadoTela.set('ABERTO');
          this.iniciarMonitoramentoResumo();
        },
        error: (err) => {
          console.error('Erro ao abrir caixa', err);
          this.notificationService.erro(
            'Erro ao abrir caixa',
            'O caixa não pôde ser aberto. Verifique a conexão.',
          );
        },
      });
  }

  fecharCaixa(): void {
    if (!this.caixaAtual() || this.isProcessando()) return;

    this.modalService.abrir({
      titulo: 'Fechar o caixa agora?',
      mensagem: 'O turno será encerrado e o resumo final será gerado.',
      tipo: 'perigo',
      textoConfirmar: 'Sim, encerrar turno',
      textoCancelar: 'Voltar',
      onConfirm: () => this.executarFechamento(),
    });
  }

  private executarFechamento(): void {
    const caixa = this.caixaAtual();
    if (!caixa) return;

    this.isProcessando.set(true);

    this.caixaService
      .fecharCaixa(caixa.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isProcessando.set(false)),
      )
      .subscribe({
        next: (resumo) => {
          this.pararMonitoramentoResumo();
          this.resumoFechamento.set(resumo as ResumoCaixa);
        },
        error: (err) => {
          console.error('Erro ao fechar caixa', err);
          this.notificationService.erro('Erro', 'Não foi possível fechar o caixa.');
        },
      });
  }

  finalizarTurno(): void {
    this.resumoFechamento.set(null);
    this.limparEstadoFechado();
  }

  // ====== Monitoramento ======
  private iniciarMonitoramentoResumo(): void {
    this.pararMonitoramentoResumo();

    this.carregarResumoAtual();
    this.carregarPedidosBalcao();

    this.intervalId = setInterval(() => {
      this.carregarResumoAtual();
      this.carregarPedidosBalcao();
    }, 5000);
  }

  private pararMonitoramentoResumo(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  carregarResumoAtual(): void {
    const caixa = this.caixaAtual();
    if (!caixa) return;

    this.caixaService
      .obterResumoAtual(caixa.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.resumoAtual.set(data as ResumoCaixa),
        error: (err) => console.error('Erro ao carregar resumo do caixa', err),
      });
  }

  carregarPedidosBalcao(): void {
    if (!this.caixaAtual()) return;

    this.caixaService
      .listarPedidosBalcao()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pedidos) => this.pedidosBalcao.set(pedidos as PedidoResponse[]),
        error: (err) => console.error('Erro ao carregar pedidos do balcão', err),
      });
  }

  // ====== Ações de balcão ======
  confirmarPagamento(pedidoId: number): void {
    this.caixaService
      .confirmarPagamento(pedidoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.carregarPedidosBalcao(),
        error: () =>
          this.notificationService.erro('Erro', 'Não foi possível confirmar o pagamento.'),
      });
  }

  avancarFluxoBalcao(pedidoId: number): void {
    this.caixaService
      .avancarPedido(pedidoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.carregarPedidosBalcao(),
        error: () => this.notificationService.erro('Erro', 'Não foi possível avançar o pedido.'),
      });
  }

  cancelarPedido(pedidoId: number): void {
    this.modalService.abrir({
      titulo: 'Descartar pedido?',
      mensagem: 'Os itens serão devolvidos ao estoque e o pedido será cancelado.',
      tipo: 'perigo',
      textoConfirmar: 'Sim, descartar',
      textoCancelar: 'Voltar',
      onConfirm: () => {
        // ---> MUDANÇA AQUI: Usa o pedidoService no lugar do caixaService <---
        this.pedidoService
          .cancelarPedido(pedidoId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.notificationService.sucesso('Cancelado', 'O pedido foi descartado com sucesso.');
              this.carregarPedidosBalcao();
            },
            error: () => this.notificationService.erro('Erro', 'Não foi possível cancelar.'),
          });
      },
    });
  }

  // ====== Cozinha ======
  pausarCozinha(): void {
    const caixa = this.caixaAtual();
    if (!caixa || this.isProcessando()) return;

    this.isProcessando.set(true);

    this.caixaService
      .alternarPausaCozinha(caixa.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isProcessando.set(false)),
      )
      .subscribe({
        next: (caixaAtualizado) => {
          this.caixaAtual.set(caixaAtualizado);

          if (caixaAtualizado.cozinhaPausada) {
            this.notificationService.sucesso('Cozinha Pausada!', 'Novos pedidos estão bloqueados.');
          } else {
            this.notificationService.sucesso('Cozinha Aberta!', 'Recebimento de pedidos retomado.');
          }
        },
        error: (err) => {
          console.error('Erro ao alternar pausa da cozinha', err);
          this.notificationService.erro(
            'Erro de Comunicação',
            'Não foi possível alterar o status da cozinha.',
          );
        },
      });
  }
}
