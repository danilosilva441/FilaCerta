import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CaixaService } from '../../../core/services/caixa.service';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
})
export class HomeComponent implements OnInit, OnDestroy {
  isAberto = false;
  isPausado = false;
  carregando = true;
  private pollingSubscription?: Subscription;

  constructor(
    private caixaService: CaixaService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.iniciarMonitoramentoLoja();
  }

  iniciarMonitoramentoLoja(): void {
    // Começa no tempo 0, e depois repete a cada 10 segundos (10000ms)
    this.pollingSubscription = timer(0, 10000)
      .pipe(switchMap(() => this.caixaService.buscarCaixaAtual()))
      .subscribe({
        next: (caixa) => {
          this.isAberto = !!caixa && caixa.status === 'ABERTO';
          this.isPausado = this.isAberto && caixa?.cozinhaPausada === true;
          this.carregando = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erro ao buscar status do caixa', err);
          this.isAberto = false;
          this.isPausado = false;
          this.carregando = false;
          this.cdr.detectChanges();
        },
      });
  }

  ngOnDestroy(): void {
    // Desliga o radar se o cliente sair da página inicial
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }
}
