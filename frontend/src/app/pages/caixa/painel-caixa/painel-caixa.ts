import { CommonModule, DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CaixaDiarioResponse } from '../../../core/models/caixa-diario.model';
import { CaixaService } from '../../../core/services/caixa.service';
import { ModalService } from '../../../core/services/modal.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-painel-caixa',
  standalone: true,
  imports: [CommonModule, DecimalPipe, FormsModule],
  templateUrl: './painel-caixa.html',
})
export class PainelCaixaComponent implements OnInit, OnDestroy {
  caixaAtual: CaixaDiarioResponse | null = null;

  resumoAtual: any = null; // <-- Vai guardar os números do Dashboard em tempo real
  resumoFechamento: any = null; // Vai guardar os dados para mostrar no modal do ticket final

  estadoTela: 'CARREGANDO' | 'FECHADO' | 'ABERTO' = 'CARREGANDO';
  valorAbertura: number = 0;
  isProcessando = false;

  private intervalId: any;

  constructor(
    private caixaService: CaixaService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
    private modalService: ModalService,
  ) {}

  ngOnInit(): void {
    this.verificarCaixa();
  }

  verificarCaixa(): void {
    this.caixaService.buscarCaixaAtual().subscribe({
      next: (caixa) => {
        if (caixa && caixa.status === 'ABERTO') {
          this.caixaAtual = caixa;
          this.estadoTela = 'ABERTO';
          this.iniciarMonitoramentoResumo();
        } else {
          this.estadoTela = 'FECHADO';
          this.pararMonitoramentoResumo();
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
      this.notificationService.erro(
        'Valor inválido',
        'O valor de abertura do caixa não pode ser negativo.',
      );
      return;
    }
    this.isProcessando = true;
    this.caixaService.abrirCaixa({ valorInicial: this.valorAbertura }).subscribe({
      next: (caixa) => {
        this.caixaAtual = caixa;
        this.estadoTela = 'ABERTO';
        this.isProcessando = false;
        this.iniciarMonitoramentoResumo();
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
    if (!this.caixaAtual) return;

    if (!confirm('Tem certeza que deseja fechar o caixa agora? O turno será encerrado.')) return;

    this.isProcessando = true;
    this.caixaService.fecharCaixa(this.caixaAtual.id).subscribe({
      next: (resumo: any) => {
        this.isProcessando = false;
        this.pararMonitoramentoResumo(); // Para de atualizar a tela quando fecha
        this.resumoFechamento = resumo;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error(err);
        this.notificationService.erro('Erro', 'Não foi possível fechar o caixa.');
        this.isProcessando = false;
      },
    });
  }

  finalizarTurno(): void {
    this.resumoFechamento = null;
    this.estadoTela = 'FECHADO';
    this.caixaAtual = null;
    this.resumoAtual = null;
  }

  iniciarMonitoramentoResumo(): void {
    this.carregarResumoAtual();
    if (!this.intervalId) {
      this.intervalId = setInterval(() => this.carregarResumoAtual(), 5000); // Atualiza a cada 5 seg
    }
  }

  pararMonitoramentoResumo(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  carregarResumoAtual(): void {
    if (!this.caixaAtual) return;

    this.caixaService.obterResumoAtual(this.caixaAtual.id).subscribe({
      next: (data) => {
        this.resumoAtual = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao carregar resumo do caixa', err),
    });
  }

  ngOnDestroy(): void {
    this.pararMonitoramentoResumo();
  }
}
