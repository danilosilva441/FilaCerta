import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CaixaService, CaixaDiarioResponse } from '../../../core/services/caixa.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { BottomNavComponent, NavItem } from '../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, DecimalPipe, RouterModule,
    HeaderComponent, LoadingSpinnerComponent, BottomNavComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  caixa = signal<CaixaDiarioResponse | null>(null);
  loading = signal(true);

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dono/dashboard' },
    { label: 'Cozinha', icon: 'cooking', route: '/dono/cozinha/painel' },
    { label: 'Caixa', icon: 'account_balance', route: '/dono/caixa/abertura' },
    { label: 'Mais', icon: 'more_horiz', route: '/dono/caixa/fechamento' },
  ];

  constructor(private caixaService: CaixaService) {}

  ngOnInit(): void {
    this.carregarCaixa();
  }

  carregarCaixa(): void {
    this.loading.set(true);
    this.caixaService.buscarCaixaHoje().subscribe({
      next: (data) => {
        this.caixa.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  get caixaAberto(): boolean {
    return this.caixa()?.status === 'ABERTO';
  }

  get totalGeral(): number {
    const c = this.caixa();
    if (!c) return 0;
    return c.totalDinheiro + c.totalDebito + c.totalCredito + c.totalPix + c.totalFiado;
  }
}
