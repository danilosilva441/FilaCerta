import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { CaixaService } from '../../../core/services/caixa.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  isAberto = false;
  isPausado = false;
  carregando = true;

  private pollingSubscription?: Subscription;

  constructor(
    private readonly caixaService: CaixaService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.iniciarMonitoramentoLoja();
  }

  private iniciarMonitoramentoLoja(): void {
    this.pararMonitoramentoLoja();

    this.pollingSubscription = timer(0, 5000)
      .pipe(switchMap(() => this.caixaService.buscarCaixaAtual()))
      .subscribe({
        next: (caixa) => this.atualizarEstadoLoja(caixa),
        error: (erro) => this.tratarErroMonitoramento(erro),
      });
  }

  private atualizarEstadoLoja(caixa: any): void {
    this.isAberto = caixa?.status === 'ABERTO';
    this.isPausado = this.isAberto && caixa?.cozinhaPausada === true;
    this.carregando = false;

    this.cdr.detectChanges();
  }

  private tratarErroMonitoramento(erro: unknown): void {
    console.error('Erro ao buscar status da loja:', erro);

    this.isAberto = false;
    this.isPausado = false;
    this.carregando = false;

    this.cdr.detectChanges();
  }

  private pararMonitoramentoLoja(): void {
    this.pollingSubscription?.unsubscribe();
    this.pollingSubscription = undefined;
  }

  ngOnDestroy(): void {
    this.pararMonitoramentoLoja();
  }
}
