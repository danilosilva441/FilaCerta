import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProdutoService } from '../../../core/services/produto.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { CartFlutuanteComponent } from '../../../shared/components/cart-flutuante/cart-flutuante.component';
import {
  ProdutoResponse,
  CategoriaProduto,
  CriarPedidoRequest,
  TipoPedido,
} from '../../../core/models';

interface CategoriaVisual {
  nome: string;
  icone: string;
  valor: CategoriaProduto | 'TODOS';
}

interface CartItem {
  produto: ProdutoResponse;
  quantidade: number;
}

@Component({
  selector: 'app-cardapio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    CartFlutuanteComponent,
  ],
  templateUrl: './cardapio.component.html',
  styleUrls: ['./cardapio.component.css'],
})
export class CardapioComponent implements OnInit {
  // Estado
  nomeCliente = signal('');
  tipoPedido = signal<TipoPedido>('LEVAR');
  categoriaSelecionada = signal<CategoriaProduto | 'TODOS'>('TODOS');
  produtos = signal<ProdutoResponse[]>([]);
  carrinho = signal<Map<number, number>>(new Map());
  loading = signal(true);
  error = signal(false);
  enviando = signal(false);

  // Categorias para o menu horizontal
  categorias: CategoriaVisual[] = [
    { nome: 'Todos', icone: '🍽️', valor: 'TODOS' },
    { nome: 'Burgers', icone: '🍔', valor: 'HAMBURGUER' },
    { nome: 'Hot Dog', icone: '🌭', valor: 'CACHORRO_QUENTE' },
    { nome: 'Salgados', icone: '🥟', valor: 'SALGADO' },
    { nome: 'Bebidas', icone: '🥤', valor: 'BEBIDA' },
    { nome: 'Porções', icone: '🍟', valor: 'PORCAO' },
  ];

  constructor(
    private produtoService: ProdutoService,
    private pedidoService: PedidoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.loading.set(true);
    this.error.set(false);

    this.produtoService.listarDisponiveis().subscribe({
      next: (data) => {
        this.produtos.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  /** Produtos filtrados pela categoria selecionada */
  get produtosFiltrados(): ProdutoResponse[] {
    const cat = this.categoriaSelecionada();
    if (cat === 'TODOS') return this.produtos();
    return this.produtos().filter((p) => p.categoria === cat);
  }

  /** Produtos agrupados por categoria (para exibição quando "Todos") */
  get produtosAgrupados(): { categoria: string; icone: string; items: ProdutoResponse[] }[] {
    const grupos = new Map<string, ProdutoResponse[]>();
    const icones: Record<string, string> = {
      HAMBURGUER: '🍔',
      CACHORRO_QUENTE: '🌭',
      SALGADO: '🥟',
      BEBIDA: '🥤',
      PORCAO: '🍟',
      ADICIONAL: '➕',
    };

    this.produtosFiltrados.forEach((p) => {
      const key = p.categoria;
      if (!grupos.has(key)) grupos.set(key, []);
      grupos.get(key)!.push(p);
    });

    return Array.from(grupos.entries()).map(([cat, items]) => ({
      categoria: cat,
      icone: icones[cat] || '📦',
      items,
    }));
  }

  // ──── Carrinho ────

  getQuantidade(produtoId: number): number {
    return this.carrinho().get(produtoId) || 0;
  }

  adicionar(produto: ProdutoResponse): void {
    const novo = new Map(this.carrinho());
    const qtd = novo.get(produto.id) || 0;
    novo.set(produto.id, qtd + 1);
    this.carrinho.set(novo);
  }

  remover(produto: ProdutoResponse): void {
    const novo = new Map(this.carrinho());
    const qtd = novo.get(produto.id) || 0;
    if (qtd <= 1) {
      novo.delete(produto.id);
    } else {
      novo.set(produto.id, qtd - 1);
    }
    this.carrinho.set(novo);
  }

  get carrinhoItens(): CartItem[] {
    const items: CartItem[] = [];
    const prods = this.produtos();
    this.carrinho().forEach((qtd, produtoId) => {
      const produto = prods.find((p) => p.id === produtoId);
      if (produto) items.push({ produto, quantidade: qtd });
    });
    return items;
  }

  get podeEnviar(): boolean {
    return this.nomeCliente().trim().length >= 2 && this.carrinho().size > 0;
  }

  limparCarrinho(): void {
    this.carrinho.set(new Map());
  }

  // ──── Envio do Pedido ────

enviarPedido(): void {
  if (!this.podeEnviar || this.enviando()) return;

  this.enviando.set(true);

  const itens = Array.from(this.carrinho().entries()).map(
    ([produtoId, quantidade]) => ({
      produtoId,
      quantidade,
    })
  );

  const request: CriarPedidoRequest = {
    nomeCliente: this.nomeCliente().trim(),
    tipo: this.tipoPedido(),
    origem: 'QR_CODE', // Origem do pedido definida como QR_CODE
    itens,
  };

  console.log('[Cardápio] Enviando pedido:', JSON.stringify(request, null, 2));

  this.pedidoService.criar(request).subscribe({
    next: (response) => {
      console.log('[Cardápio] Pedido criado:', response);
      this.enviando.set(false);
      this.router.navigate(['/cliente/acompanhamento', response.id]);
    },
    error: (err: Error) => {
      console.error('[Cardápio] Erro:', err);
      this.enviando.set(false);
      alert('Erro ao criar pedido. Tente novamente.');
    },
  });
}

  /** TrackBy para performance nas listas */
  trackByProdutoId(index: number, produto: ProdutoResponse): number {
    return produto.id;
  }
}
