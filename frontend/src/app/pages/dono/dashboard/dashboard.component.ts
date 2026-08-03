import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common'; // CommonModule removido para poupar memória
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { CaixaService, CaixaDiarioResponse } from '../../../core/services/caixa.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { BottomNavComponent, NavItem } from '../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DecimalPipe,
    RouterModule,
    HeaderComponent,
    LoadingSpinnerComponent,
    BottomNavComponent,
  ],
  templateUrl: './dashboard.component.html',
  // O OnPush evita que a tela fique piscando/recalculando à toa
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  private caixaService = inject(CaixaService);

  // Estados principais
  caixa = signal<CaixaDiarioResponse | null>(null);
  loading = signal(true);

  // ✨ MÁGICA DOS SIGNALS: O 'computed' guarda o valor na memória.
  // Ele NÃO refaz a conta toda vez que o usuário clica na tela,
  // diferente do 'get totalGeral()' antigo que pesava o celular.
  caixaAberto = computed(() => this.caixa()?.status === 'ABERTO');

  totalGeral = computed(() => {
    const c = this.caixa();
    if (!c) return 0;
    return c.totalDinheiro + c.totalDebito + c.totalCredito + c.totalPix + c.totalFiado;
  });

  // Ícones do Material Icons corrigidos ('cooking' não existe, o correto é 'soup_kitchen')
  navItems: NavItem[] = [
    { label: 'Painel', icon: 'dashboard', route: '/dono/dashboard' },
    { label: 'Cozinha', icon: 'soup_kitchen', route: '/dono/cozinha/painel' },
    { label: 'Comandas', icon: 'receipt_long', route: '/dono/comandas' },
    { label: 'Relatórios', icon: 'analytics', route: '/dono/relatorios/hoje' },
  ];

  ngOnInit(): void {
    this.carregarCaixa();
  }

  carregarCaixa(): void {
    this.loading.set(true);

    this.caixaService.buscarCaixaHoje()
      .pipe(
        // finalize sempre executa, dando erro ou sucesso. Evita que o spinner fique girando pra sempre.
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (data) => this.caixa.set(data),
        error: (err) => console.error('[Dashboard] Erro ao carregar caixa:', err)
      });
  }
}
