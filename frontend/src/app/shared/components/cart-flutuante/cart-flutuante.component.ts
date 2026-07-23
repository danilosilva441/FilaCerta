import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProdutoResponse } from '../../../core/models';

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

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onClear = new EventEmitter<void>();

  get total(): number {
    return this.itens.reduce((sum, item) => {
      return sum + item.produto.preco * item.quantidade;
    }, 0);
  }

  get totalItens(): number {
    return this.itens.reduce((sum, item) => sum + item.quantidade, 0);
  }

  /** TrackBy para melhor performance no *ngFor */
  trackByProduto(index: number, item: CartItem): number {
    return item.produto.id;
  }
}
