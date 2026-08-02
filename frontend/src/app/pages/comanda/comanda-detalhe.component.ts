import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ComandaService } from '../../core/services/comanda.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { BottomNavComponent, NavItem } from '../../shared/components/bottom-nav/bottom-nav.component';
import { ComandaResponse, PedidoResponse, StatusPedido } from '../../core/models';

@Component({
  selector: 'app-comanda-detalhe',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    DecimalPipe,
    RouterModule,
    HeaderComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    BottomNavComponent,
  ],
  templateUrl: './comanda-detalhe.component.html',
  styleUrls: ['./comanda-detalhe.component.css'],
})
export class ComandaDetalheComponent implements OnInit {
  comanda = signal<ComandaResponse | null>(null);
  loading = signal(true);
  error = signal(false);
  fechando = signal(false);
  showFecharDialog = signal(false);
  sucesso = signal(false);

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dono/dashboard' },
    { label: 'Cozinha', icon: 'cooking', route: '/dono/cozinha/painel' },
    { label: 'Caixa', icon: 'account_balance', route: '/dono/caixa/abertura' },
    { label: 'Mais', icon: 'more_horiz', route: '/dono/caixa/fechamento' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private comandaService: ComandaService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.carregarComanda(id);
    } else {
      this.error.set(true);
      this.loading.set(false);
    }
  }

  carregarComanda(id: number): void {
    this.loading.set(true);
    this.error.set(false);
    this.comandaService.buscarPorId(id).subscribe({
      next: (data: ComandaResponse) => {
        this.comanda.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  get totalComanda(): number {
    const c = this.comanda();
    if (!c) return 0;
    return c.pedidos
      .filter((p: PedidoResponse) => p.status !== 'CANCELADO')
      .reduce((sum: number, p: PedidoResponse) => sum + p.valorTotal, 0);
  }

  get totalPedidos(): number {
    return this.comanda()?.pedidos?.length || 0;
  }

  get pedidosAtivos(): PedidoResponse[] {
    return this.comanda()?.pedidos?.filter(
      (p: PedidoResponse) => p.status !== 'CANCELADO' && p.status !== 'ENTREGUE'
    ) || [];
  }

  get pedidosFinalizados(): PedidoResponse[] {
    return this.comanda()?.pedidos?.filter(
      (p: PedidoResponse) => p.status === 'ENTREGUE' || p.status === 'PRONTO'
    ) || [];
  }

  statusIcon(status: StatusPedido): string {
    const icons: Record<StatusPedido, string> = {
      RECEBIDO: '📋', PREPARANDO: '🔥', PRONTO: '✅', ENTREGUE: '📦', CANCELADO: '❌',
    };
    return icons[status] || '📋';
  }

  get tempoAberta(): string {
    const abertura = this.comanda()?.abertura;
    if (!abertura) return '';
    const inicio = new Date(abertura).getTime();
    const agora = Date.now();
    const minutos = Math.floor((agora - inicio) / 60000);
    if (minutos < 60) return `${minutos}min`;
    const horas = Math.floor(minutos / 60);
    const resto = minutos % 60;
    return `${horas}h ${resto}min`;
  }

  abrirFecharDialog(): void { this.showFecharDialog.set(true); }
  fecharFecharDialog(): void { this.showFecharDialog.set(false); }

  confirmarFechamento(): void {
    const id = this.comanda()?.id;
    if (!id) return;
    this.fechando.set(true);
    this.showFecharDialog.set(false);

    this.comandaService.fechar(id).subscribe({
      next: (data: ComandaResponse) => {
        this.comanda.set(data);
        this.fechando.set(false);
        this.sucesso.set(true);
        setTimeout(() => this.router.navigate(['/dono/dashboard']), 2000);
      },
      error: (err: any) => {
        this.fechando.set(false);
        const mensagem = err?.mensagemAmigavel || err?.message || 'Erro ao fechar comanda.';
        alert(mensagem);
      },
    });
  }

  verPedido(pedidoId: number): void {
    this.router.navigate(['/cliente/pedido', pedidoId]);
  }

  adicionarPedido(): void {
    this.router.navigate(['/cliente/cardapio']);
  }

  voltar(): void {
    window.history.back();
  }
}
