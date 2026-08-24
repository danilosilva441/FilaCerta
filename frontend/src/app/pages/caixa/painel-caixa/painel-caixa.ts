import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CaixaDiarioResponse } from '../../../core/models/caixa-diario.model';
import { PedidoResponse } from '../../../core/models/pedido.model';
import { CaixaDiarioService } from '../../../core/services/caixa-diario.service';
import { CaixaService } from '../../../core/services/caixa.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ModalService } from '../../../core/services/modal.service';

@Component({
  selector: 'app-painel-caixa',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './painel-caixa.html',
})
export class PainelCaixaComponent implements OnInit, OnDestroy {
  pedidosPendentes: PedidoResponse[] = [];
  caixaAtual: CaixaDiarioResponse | null = null;

  estadoTela: 'CARREGANDO' | 'FECHADO' | 'ABERTO' = 'CARREGANDO';
  valorAbertura: number = 0;
  isProcessando = false;

  private intervalId: any;

  constructor(
    private caixaService: CaixaService,
    private caixaDiarioService: CaixaDiarioService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
    private modalService: ModalService,
  ) {}

  ngOnInit(): void {
    this.verificarCaixa();
  }

  verificarCaixa(): void {
    this.caixaDiarioService.buscarCaixaAtual().subscribe({
      next: (caixa) => {
        if (caixa && caixa.status === 'ABERTO') {
          this.caixaAtual = caixa;
          this.estadoTela = 'ABERTO';
          this.iniciarMonitoramentoPedidos();
        } else {
          this.estadoTela = 'FECHADO';
          this.pararMonitoramentoPedidos();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao buscar status do caixa', err);
        this.estadoTela = 'FECHADO';
        this.cdr.detectChanges();
      },
    });
  }

  abrirCaixa(): void {
    if (this.valorAbertura < 0) {
      // oxlint-disable-next-line no-unused-expressions
      this.notificationService.erro(
        'Valor inválido',
        'O valor de abertura do caixa não pode ser negativo.',
      );
      return;
    }
    this.isProcessando = true;
    this.caixaDiarioService.abrirCaixa({ valorInicial: this.valorAbertura }).subscribe({
      next: (caixa) => {
        this.caixaAtual = caixa;
        this.estadoTela = 'ABERTO';
        this.isProcessando = false;
        this.iniciarMonitoramentoPedidos();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.notificationService.erro(
          'Erro ao abrir caixa',
          'O caixa não pôde ser aberto. Verifique a conexão.',
        );
        this.isProcessando = false;
      },
    });
  }

  fecharCaixa(): void {
    this.modalService.confirmar({
      titulo: 'Fechar o Caixa',
      mensagem: 'Tem certeza que deseja fechar o caixa? Operações de recebimento serão suspensas.',
      textoConfirmar: 'Sim, Fechar Caixa',
      onConfirm: () => {
        this.isProcessando = true;
        this.caixaDiarioService.fecharCaixa().subscribe({
          next: () => {
            this.caixaAtual = null;
            this.estadoTela = 'FECHADO';
            this.isProcessando = false;
            this.valorAbertura = 0;
            this.pararMonitoramentoPedidos();
            this.cdr.detectChanges();
            this.notificationService.sucesso('Tudo Certo!', 'O caixa foi fechado com sucesso.');
          },
          error: (err) => {
            console.error(err);
            this.notificationService.erro('Erro', 'Falha ao fechar o caixa.');
            this.isProcessando = false;
          },
        });
      },
    });
  }

  iniciarMonitoramentoPedidos(): void {
    this.carregarPendentes();
    if (!this.intervalId) {
      this.intervalId = setInterval(() => this.carregarPendentes(), 5000);
    }
  }

  pararMonitoramentoPedidos(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.pedidosPendentes = [];
  }

  carregarPendentes(): void {
    this.caixaService.listarPagamentosPendentes().subscribe({
      next: (data) => {
        this.pedidosPendentes = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao carregar pagamentos pendentes', err),
    });
  }

  confirmarPagamento(pedidoId: number): void {
    if (this.isProcessando) return;
    if (!confirm(`Confirmar o pagamento do pedido #${pedidoId}?`)) return;

    this.isProcessando = true;
    this.caixaService.atualizarPagamento(pedidoId, 'PAGO').subscribe({
      next: () => {
        this.pedidosPendentes = this.pedidosPendentes.filter((p) => p.id !== pedidoId);
        this.isProcessando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.notificationService.erro(
          'Erro ao confirmar pagamento',
          'O pagamento não pôde ser confirmado. Tente novamente.',
        );
        this.isProcessando = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.pararMonitoramentoPedidos();
  }
}
