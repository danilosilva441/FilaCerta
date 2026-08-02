import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CategoriaProduto,
  CriarPedidoRequest,
  MetodoPagamento, // ← ADICIONAR
  PedidoResponse,
  ProdutoResponse,
  TipoPedido,
} from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';
import { CaixaService } from '../../../core/services/caixa.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { ProdutoService } from '../../../core/services/produto.service';
import { BottomNavComponent, NavItem } from '../../../shared/components/bottom-nav/bottom-nav.component';
import { CartFlutuanteComponent } from '../../../shared/components/cart-flutuante/cart-flutuante.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

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
    BottomNavComponent,
  ],
  templateUrl: './cardapio.component.html',
  styleUrls: ['./cardapio.component.css'],
})
export class CardapioComponent implements OnInit {
  // Estado
  tipoPedido = signal<TipoPedido>('LEVAR');
  categoriaSelecionada = signal<CategoriaProduto | 'TODOS'>('TODOS');
  produtos = signal<ProdutoResponse[]>([]);
  carrinho = signal<Map<number, number>>(new Map());
  loading = signal(true);
  error = signal(false);
  enviando = signal(false);

  // Edição
  editandoPedido = signal(false);
  pedidoEditando = signal<PedidoResponse | null>(null);
  pedidoIdEditando = signal<number | null>(null);

  // Caixa
  caixaAberto = signal(true);
  showCaixaFechadoDialog = signal(false);

  // Pagamento
  formaPagamento = signal<MetodoPagamento | null>(null);
  metodosPagamento: { valor: MetodoPagamento; label: string; icone: string }[] = [
    { valor: 'DINHEIRO', label: 'Dinheiro', icone: '💵' },
    { valor: 'CARTAO_DEBITO', label: 'Débito', icone: '💳' },
    { valor: 'CARTAO_CREDITO', label: 'Crédito', icone: '💳' },
    { valor: 'PIX', label: 'PIX', icone: '📱' },
  ];

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
    private caixaService: CaixaService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const pedidoId = this.route.snapshot.queryParamMap.get('pedidoId');
    if (pedidoId) {
      this.pedidoIdEditando.set(Number(pedidoId));
      this.carregarPedidoParaEdicao(Number(pedidoId));
    } else {
      this.verificarCaixa();
    }
  }

  // ──── Pagamento ────
  selecionarPagamento(metodo: MetodoPagamento): void {
    this.formaPagamento.set(metodo);
  }

  // ──── Edição ────
  carregarPedidoParaEdicao(id: number): void {
    this.loading.set(true);
    this.editandoPedido.set(true);
    this.pedidoService.buscarPorId(id).subscribe({
      next: (pedido) => {
        this.pedidoEditando.set(pedido);
        this.tipoPedido.set(pedido.tipo);
        const carrinhoMap = new Map<number, number>();
        pedido.itens.forEach(item => carrinhoMap.set(item.produtoId, item.quantidade));
        this.carrinho.set(carrinhoMap);
        this.verificarCaixa();
      },
      error: () => {
        this.editandoPedido.set(false);
        this.verificarCaixa();
      },
    });
  }

  cancelarEdicao(): void {
    const id = this.pedidoEditando()?.id;
    this.editandoPedido.set(false);
    this.pedidoEditando.set(null);
    this.pedidoIdEditando.set(null);
    this.limparCarrinho();
    if (id) {
      this.router.navigate(['/cliente/acompanhamento', id]);
    } else {
      this.router.navigate(['/cliente/cardapio']);
    }
  }

  // ──── Caixa ────
  verificarCaixa(): void {
    this.loading.set(true);
    this.caixaService.buscarCaixaHoje().subscribe({
      next: (caixa) => {
        const aberto = caixa?.status === 'ABERTO';
        this.caixaAberto.set(aberto);
        if (aberto) this.carregarProdutos();
        else { this.loading.set(false); this.showCaixaFechadoDialog.set(true); }
      },
      error: () => {
        this.caixaAberto.set(false);
        this.loading.set(false);
        this.showCaixaFechadoDialog.set(true);
      },
    });
  }

  tentarNovamente(): void {
    this.showCaixaFechadoDialog.set(false);
    this.verificarCaixa();
  }

  irParaLoginDono(): void {
    this.router.navigate(['/dono/login']);
  }

  // ──── Navegação ────
  get nomeCliente(): string {
    return this.authService.usuario()?.nomeCliente || '';
  }

  sair(): void {
    this.authService.logout();
  }

  // ──── Produtos ────
  carregarProdutos(): void {
    this.loading.set(true);
    this.error.set(false);
    this.produtoService.listarDisponiveis().subscribe({
      next: (data) => { this.produtos.set(data); this.loading.set(false); },
      error: () => { this.error.set(true); this.loading.set(false); },
    });
  }

  get produtosFiltrados(): ProdutoResponse[] {
    const cat = this.categoriaSelecionada();
    if (cat === 'TODOS') return this.produtos();
    return this.produtos().filter((p) => p.categoria === cat);
  }

  get produtosAgrupados(): { categoria: string; icone: string; items: ProdutoResponse[] }[] {
    const grupos = new Map<string, ProdutoResponse[]>();
    const icones: Record<string, string> = {
      HAMBURGUER: '🍔', CACHORRO_QUENTE: '🌭', SALGADO: '🥟',
      BEBIDA: '🥤', PORCAO: '🍟', ADICIONAL: '➕',
    };
    this.produtosFiltrados.forEach((p) => {
      const key = p.categoria;
      if (!grupos.has(key)) grupos.set(key, []);
      grupos.get(key)!.push(p);
    });
    return Array.from(grupos.entries()).map(([cat, items]) => ({
      categoria: cat, icone: icones[cat] || '📦', items,
    }));
  }

  // ──── Carrinho ────
  getQuantidade(produtoId: number): number { return this.carrinho().get(produtoId) || 0; }

  adicionar(produto: ProdutoResponse): void {
    const novo = new Map(this.carrinho());
    novo.set(produto.id, (novo.get(produto.id) || 0) + 1);
    this.carrinho.set(novo);
  }

  remover(produto: ProdutoResponse): void {
    const novo = new Map(this.carrinho());
    const qtd = novo.get(produto.id) || 0;
    if (qtd <= 1) novo.delete(produto.id);
    else novo.set(produto.id, qtd - 1);
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

  get podeEnviar(): boolean { return this.carrinho().size > 0 && this.caixaAberto(); }
  limparCarrinho(): void { this.carrinho.set(new Map()); }
  get botaoTexto(): string { return this.editandoPedido() ? 'Atualizar Pedido' : 'Fazer Pedido'; }

  // ──── Envio ────
  enviarPedido(): void {
    if (!this.podeEnviar || this.enviando()) return;
    if (!this.caixaAberto()) { this.showCaixaFechadoDialog.set(true); return; }
    this.enviando.set(true);

    const itens = Array.from(this.carrinho().entries()).map(
      ([produtoId, quantidade]) => ({ produtoId, quantidade })
    );

    if (this.editandoPedido() && this.pedidoEditando()) {
      this.atualizarPedidoExistente(itens);
    } else {
      this.criarNovoPedido(itens);
    }
  }

  criarNovoPedido(itens: { produtoId: number; quantidade: number }[]): void {
    const request: CriarPedidoRequest = {
      nomeCliente: this.nomeCliente,
      tipo: this.tipoPedido(),
      origem: 'QR_CODE',
      itens,
    };

    this.pedidoService.criar(request).subscribe({
      next: (response) => {
        const metodo = this.formaPagamento();
        if (metodo) {
          this.registrarPagamentoInicial(response.id, metodo);
        } else {
          this.finalizarPedido(response.id);
        }
      },
      error: (err: any) => this.tratarErroEnvio(err),
    });
  }

  registrarPagamentoInicial(pedidoId: number, metodo: MetodoPagamento): void {
    this.pedidoService.registrarPagamento(pedidoId, { metodoPagamento: metodo }, false).subscribe({
      next: () => this.finalizarPedido(pedidoId),
      error: () => this.finalizarPedido(pedidoId),
    });
  }

  finalizarPedido(pedidoId: number): void {
    this.authService.setPedidoAtivo(pedidoId);
    this.limparCarrinho();
    this.formaPagamento.set(null);
    this.enviando.set(false);
    this.router.navigate(['/cliente/acompanhamento', pedidoId]);
  }

  atualizarPedidoExistente(itens: { produtoId: number; quantidade: number }[]): void {
    const pedidoAtual = this.pedidoEditando()!;
    const request = {
      nomeCliente: pedidoAtual.nomeCliente,
      tipo: pedidoAtual.tipo,
      origem: pedidoAtual.origem,
      itens,
      observacao: pedidoAtual.observacao || '',
    };
    this.pedidoService.atualizarPedido(pedidoAtual.id, request).subscribe({
      next: (response) => {
        this.limparCarrinho();
        this.editandoPedido.set(false);
        this.enviando.set(false);
        this.router.navigate(['/cliente/acompanhamento', response.id]);
      },
      error: (err: any) => this.tratarErroEnvio(err),
    });
  }

  tratarErroEnvio(err: any): void {
    if (err?.status === 400 && err?.error?.message?.toLowerCase().includes('fechado')) {
      this.caixaAberto.set(false);
      this.showCaixaFechadoDialog.set(true);
    } else {
      const mensagem = err?.mensagemAmigavel || 'Erro ao processar pedido. Tente novamente.';
      alert(mensagem);
    }
    this.enviando.set(false);
  }

  trackByProdutoId(index: number, produto: ProdutoResponse): number { return produto.id; }

  // ──── Navegação Inferior ────
  get navItems(): NavItem[] {
    const pedidoId = this.authService.getPedidoAtivoId();
    const items: NavItem[] = [
      { label: 'Início', icon: 'home', route: '/cliente/home' },
      { label: 'Cardápio', icon: 'restaurant_menu', route: '/cliente/cardapio' },
    ];
    if (pedidoId) {
      items.push({
        label: 'Meu Pedido',
        icon: 'receipt_long',
        route: `/cliente/acompanhamento/${pedidoId}`,
        badge: 1,
      });
    }
    items.push({ label: 'Sair', icon: 'logout', route: '/cliente/login' });
    return items;
  }
}
