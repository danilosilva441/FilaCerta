import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProdutoResponse, MetodoPagamento } from '../../../core/models';

interface CartItem {
  produto: ProdutoResponse;
  quantidade: number;
}

@Component({
  selector: 'app-cart-flutuante',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-flutuante.component.html',
  styleUrls: ['./cart-flutuante.component.css'],
})
export class CartFlutuanteComponent {
  @Input() itens: CartItem[] = [];
  @Input() buttonText = 'Fazer Pedido';
  @Input() disabled = false;
  @Input() pagamentoSelecionado: MetodoPagamento | null = null;
  @Input() metodosPagamento: { valor: MetodoPagamento; label: string; icone: string }[] = [];

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onClear = new EventEmitter<void>();
  @Output() onSelectPagamento = new EventEmitter<MetodoPagamento>();

  get total(): number {
    return this.itens.reduce((sum, item) => sum + item.produto.preco * item.quantidade, 0);
  }

  get totalItens(): number {
    return this.itens.reduce((sum, item) => sum + item.quantidade, 0);
  }

  trackByProduto(index: number, item: CartItem): number {
    return item.produto.id;
  }
}
