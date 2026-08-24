import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CriarPedidoRequest, ItemPedidoRequest } from '../../../core/models/pedido.model';
import { Produto } from '../../../core/models/produto.model';
import { NotificationService } from '../../../core/services/notification.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { ProdutoService } from '../../../core/services/produto.service';

@Component({
  selector: 'app-cardapio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cardapio.html',
  styleUrls: ['./cardapio.css'],
})
export class CardapioComponent implements OnInit {
  nomeCliente = '';
  tipoPedido: 'LEVAR' | 'COMER_AQUI' = 'COMER_AQUI';
  formaPagamento: 'PIX' | 'CARTAO' | 'DINHEIRO' = 'PIX';

  categorias = ['TODOS', 'HAMBURGUER', 'CACHORRO_QUENTE', 'SALGADO', 'BEBIDA', 'ADICIONAL'];
  categoriaSelecionada = 'TODOS';

  produtos: Produto[] = [];
  carrinho: Map<number, number> = new Map(); // produtoId -> quantidade

  isProcessando = false;
  isCarrinhoAberto = false;
  tentouEnviar = false;

  constructor(
    private produtoService: ProdutoService,
    private pedidoService: PedidoService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.produtoService.listar(this.categoriaSelecionada).subscribe({
      next: (data) => {
        this.produtos = data;
        this.cdr.detectChanges(); // Força a detecção de mudanças após a atualização da lista de produtos
      },
      error: (err) => console.error('Erro ao carregar produtos', err),
    });
  }

  filtrarPorCategoria(cat: string): void {
    if (this.categoriaSelecionada === cat) return; // Se a categoria já estiver selecionada, não faz nada

    this.categoriaSelecionada = cat;
    this.produtos = []; // Limpa a lista de produtos antes de carregar os novos
    this.cdr.detectChanges(); // Força a detecção de mudanças para atualizar a UI imediatamente

    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.produtoService.listar(this.categoriaSelecionada).subscribe({
      next: (data) => {
        console.log(`Chegaram ${data.length} produtos da categoria ${this.categoriaSelecionada}`);
        this.produtos = data;
        this.cdr.detectChanges(); // Força a detecção de mudanças após a atualização da lista de produtos
      },
      error: (err) => console.error('Erro ao carregar produtos', err),
    });
  }

  adicionarItem(produto: Produto): void {
    const qtd = this.carrinho.get(produto.id) || 0;
    this.carrinho.set(produto.id, qtd + 1);
  }

  removerItem(produto: Produto): void {
    const qtd = this.carrinho.get(produto.id) || 0;
    if (qtd <= 1) {
      this.carrinho.delete(produto.id);
    } else {
      this.carrinho.set(produto.id, qtd - 1);
    }
  }

  getQuantidade(produto: Produto): number {
    return this.carrinho.get(produto.id) || 0;
  }

  get totalItens(): number {
    let total = 0;
    this.carrinho.forEach((qtd) => (total += qtd));
    return total;
  }

  get total(): number {
    let total = 0;
    this.carrinho.forEach((qtd, produtoId) => {
      const produto = this.produtos.find((p) => p.id === produtoId);
      if (produto) total += produto.preco * qtd;
    });
    return total;
  }

  getItensCarrinho(): { produto: Produto; quantidade: number }[] {
    const itens: { produto: Produto; quantidade: number }[] = [];
    this.carrinho.forEach((quantidade, produtoId) => {
      const produto = this.produtos.find((p) => p.id === produtoId);
      if (produto) {
        itens.push({ produto, quantidade });
      }
    });
    return itens;
  }

  podeEnviar(): boolean {
    return this.nomeCliente.trim().length >= 2 && this.carrinho.size > 0 && !this.isProcessando;
  }

  enviarPedido(): void {
    if (this.carrinho.size === 0) return;

    if (!this.nomeCliente || this.nomeCliente.trim() === '') {
      this.tentouEnviar = true;
      this.notificationService.aviso(
        'Atenção',
        'Por favor, informe seu nome para chamarmos quando estiver pronto!',
      );
      return;
    }

    this.isProcessando = true;
    this.tentouEnviar = false;

    const itens: ItemPedidoRequest[] = [];
    this.carrinho.forEach((quantidade, produtoId) => {
      itens.push({ produtoId, quantidade });
    });

    const request: CriarPedidoRequest = {
      nomeCliente: this.nomeCliente.trim(),
      tipo: this.tipoPedido,
      origem: 'MANUAL',
      itens,
    };

    this.pedidoService.criarPedido(request).subscribe({
      next: (response) => {
        this.carrinho.clear();
        this.nomeCliente = '';
        this.isProcessando = false;
        this.isCarrinhoAberto = false;
        // Redireciona o usuário para a tela que criamos agora!
        this.router.navigate(['/cliente/acompanhamento', response.id]);
      },
      error: (err) => {
        console.error(err);
        this.notificationService.erro(
          'Erro ao enviar pedido',
          'O pedido não pôde ser enviado. Tente novamente.',
        );
        this.isProcessando = false;
      },
    });
  }

  abrirCarrinho(): void {
    if (this.totalItens === 0) {
      this.notificationService.aviso('Carrinho Vazio', 'Adicione itens antes de fechar o pedido.');
      return;
    }
    this.isCarrinhoAberto = true;
  }

  fecharCarrinho(): void {
    this.isCarrinhoAberto = false;
    this.tentouEnviar = false;
  }
}
