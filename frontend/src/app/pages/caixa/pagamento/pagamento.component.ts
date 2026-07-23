import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PedidoService } from '../../../core/services/pedido.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import {
  PedidoResponse,
  MetodoPagamento,
  RegistrarPagamentoRequest,
} from '../../../core/models';

interface MetodoPagamentoVisual {
  valor: MetodoPagamento;
  label: string;
  icone: string;
  cor: string;
}

@Component({
  selector: 'app-pagamento',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DecimalPipe,
    HeaderComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './pagamento.component.html',
  styleUrls: ['./pagamento.component.css'],
})
export class PagamentoComponent implements OnInit {
  pedido = signal<PedidoResponse | null>(null);
  loading = signal(true);
  error = signal(false);

  // Pagamento
  metodoSelecionado = signal<MetodoPagamento | null>(null);
  valorRecebido = signal<number>(0);
  processando = signal(false);
  sucesso = signal(false);
  showConfirmDialog = signal(false);

  // Métodos disponíveis
  metodosPagamento: MetodoPagamentoVisual[] = [
    { valor: 'DINHEIRO', label: 'Dinheiro', icone: 'payments', cor: 'bg-green-100 text-green-700 border-green-300' },
    { valor: 'CARTAO_DEBITO', label: 'Débito', icone: 'credit_card', cor: 'bg-blue-100 text-blue-700 border-blue-300' },
    { valor: 'CARTAO_CREDITO', label: 'Crédito', icone: 'credit_score', cor: 'bg-purple-100 text-purple-700 border-purple-300' },
    { valor: 'PIX', label: 'PIX', icone: 'pix', cor: 'bg-teal-100 text-teal-700 border-teal-300' },
    { valor: 'FIADO', label: 'Fiado', icone: 'receipt_long', cor: 'bg-orange-100 text-orange-700 border-orange-300' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pedidoService: PedidoService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.carregarPedido(id);
    } else {
      this.error.set(true);
      this.loading.set(false);
    }
  }

  carregarPedido(id: number): void {
    this.loading.set(true);
    this.error.set(false);

    this.pedidoService.buscarPorId(id).subscribe({
      next: (data) => {
        this.pedido.set(data);

        // Se já estiver pago, redireciona
        if (data.statusPagamento === 'PAGO') {
          this.sucesso.set(true);
        }

        // Pré-seleciona valor recebido = total
        this.valorRecebido.set(data.valorTotal);

        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  get troco(): number {
    const recebido = this.valorRecebido();
    const total = this.pedido()?.valorTotal || 0;
    return Math.max(0, recebido - total);
  }

  get podeConfirmar(): boolean {
    const metodo = this.metodoSelecionado();
    if (!metodo) return false;

    // Fiado não precisa de valor recebido
    if (metodo === 'FIADO') return true;

    // Dinheiro precisa de valor >= total
    if (metodo === 'DINHEIRO') {
      return this.valorRecebido() >= (this.pedido()?.valorTotal || 0);
    }

    // Cartão e PIX = valor exato
    return true;
  }

  selecionarMetodo(metodo: MetodoPagamento): void {
    this.metodoSelecionado.set(metodo);

    // Resetar valor recebido ao trocar método
    if (metodo === 'DINHEIRO') {
      this.valorRecebido.set(this.pedido()?.valorTotal || 0);
    }
  }

  abrirConfirmDialog(): void {
    this.showConfirmDialog.set(true);
  }

  fecharConfirmDialog(): void {
    this.showConfirmDialog.set(false);
  }

  confirmarPagamento(): void {
    const pedidoId = this.pedido()?.id;
    const metodo = this.metodoSelecionado();
    if (!pedidoId || !metodo) return;

    this.processando.set(true);
    this.showConfirmDialog.set(false);

    const request: RegistrarPagamentoRequest = {
      metodoPagamento: metodo,
    };

    this.pedidoService.registrarPagamento(pedidoId, request).subscribe({
      next: (data) => {
        this.pedido.set(data);
        this.processando.set(false);
        this.sucesso.set(true);
      },
      error: (err: Error) => {
        this.processando.set(false);
        alert(err.message || 'Erro ao registrar pagamento.');
      },
    });
  }

  voltar(): void {
    window.history.back();
  }

  novoPedido(): void {
    this.router.navigate(['/cliente/cardapio']);
  }
}
