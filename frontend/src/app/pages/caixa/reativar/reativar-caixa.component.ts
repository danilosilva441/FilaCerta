import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CaixaService } from '../../../core/services/caixa.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { BottomNavComponent, NavItem } from '../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-reativar-caixa',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    LoadingSpinnerComponent,
    BottomNavComponent,
  ],
  templateUrl: './reativar-caixa.component.html',
  styleUrls: ['./reativar-caixa.component.css'],
})
export class ReativarCaixaComponent implements OnInit {
  reativando = signal(false);
  erro = signal(false);
  mensagemErro = signal('');
  sucesso = signal(false);
  motivoPausa = signal('');
  tempoEstimado = signal('');
  horaPausa = signal('');

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Cozinha', icon: 'cooking', route: '/cozinha/painel' },
    { label: 'Caixa', icon: 'account_balance', route: '/caixa/abertura' },
    { label: 'Mais', icon: 'more_horiz', route: '/caixa/fechamento' },
  ];

  constructor(
    private caixaService: CaixaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarDadosPausa();
  }

  carregarDadosPausa(): void {
    this.caixaService.buscarCaixaHoje().subscribe({
      next: (caixa) => {
        if (caixa) {
          this.motivoPausa.set(caixa.motivoPausa || '');
          this.tempoEstimado.set(caixa.tempoEstimadoRetorno || '');
          this.horaPausa.set(caixa.horaPausa || '');
        }
      },
      error: () => {},
    });
  }

  reativar(): void {
    this.reativando.set(true);
    this.erro.set(false);

    this.caixaService.reativar().subscribe({
      next: () => {
        this.reativando.set(false);
        this.sucesso.set(true);
        setTimeout(() => {
          this.router.navigate(['/cozinha/painel']);
        }, 1500);
      },
      error: (err: any) => {
        this.reativando.set(false);
        this.erro.set(true);
        this.mensagemErro.set(err?.mensagemAmigavel || err?.message || 'Erro ao reativar.');
      },
    });
  }

  voltar(): void {
    window.history.back();
  }
}
