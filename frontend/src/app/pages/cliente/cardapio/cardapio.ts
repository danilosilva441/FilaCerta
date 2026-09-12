import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CriarPedidoRequest, ItemPedidoRequest } from '../../../core/models/pedido.model';
import { Produto } from '../../../core/models/produto.model';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { ProdutoService } from '../../../core/services/produto.service';
import { CaixaService } from '../../../core/services/caixa.service';

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

  // 1. Ajustamos as categorias para baterem EXATAMENTE com o banco de dados (V4)
  categorias = ['TODOS', 'HAMBURGUER', 'CACHORRO_QUENTE', 'BEBIDA', 'ACOMPANHAMENTO'];
  categoriaSelecionada = 'TODOS';

  produtos: Produto[] = [];
  carrinho: Map<number, number> = new Map();

  isDono = false;
  jaPago = false;
  isProcessando = false;
  isCarrinhoAberto = false;
  tentouEnviar = false;

  constructor(
    private produtoService: ProdutoService,
    private pedidoService: PedidoService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
    private authService: AuthService,
    private caixaService: CaixaService,
  ) {}

  ngOnInit(): void {
    this.blindarCardapio();
    this.isDono = this.authService.isDono();

    // 2. Usamos a própria função carregarProdutos para evitar código duplicado
    this.carregarProdutos();
  }

  filtrarPorCategoria(cat: string): void {
    if (this.categoriaSelecionada === cat) return;

    this.categoriaSelecionada = cat;
    this.produtos = [];
    this.cdr.detectChanges();

    this.carregarProdutos();
  }

  carregarProdutos(): void {
    // 3. A MÁGICA: Se for 'TODOS', mandamos vazio (ou undefined) para o backend não filtrar nada!
    const categoriaParaBackend =
      this.categoriaSelecionada === 'TODOS' ? '' : this.categoriaSelecionada;

    this.produtoService.listar(categoriaParaBackend).subscribe({
      next: (data) => {
        console.log(`Chegaram ${data.length} produtos da categoria ${this.categoriaSelecionada}`);
        this.produtos = data;
        this.cdr.detectChanges();
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

    // Se for o dono lançando, o nome não precisa ser obrigatório (pode ser "Balcão")
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

    // O payload muda dependendo de quem esta pedindo. Se for o dono, a origem é "MANUAL", se for o cliente, a origem é "CLIENTE"
    const request: CriarPedidoRequest = {
      nomeCliente: this.nomeCliente.trim() || (this.isDono ? 'Balcão' : ''), // Se for dono e não informar nome, coloca "Balcão"
      tipo: this.tipoPedido,
      origem: this.isDono ? 'MANUAL' : 'QR_CODE',
      formaPagamento: this.formaPagamento,
      // Se for o dono, envia PAGO ou AGUARDANDO dependendo do botão. Se for cliente, envia AGUARDANDO.
      statusPagamento: this.isDono ? (this.jaPago ? 'PAGO' : 'AGUARDANDO') : 'AGUARDANDO', // Se for dono, já marca como pago
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
        this.cdr.detectChanges();
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

  blindarCardapio(): void {
    this.caixaService.buscarCaixaAtual().subscribe({
      next: (caixa) => {
        // Se não tiver caixa, se não estiver ABERTO, ou se a cozinha estiver PAUSADA:
        if (!caixa || caixa.status !== 'ABERTO' || caixa.cozinhaPausada === true) {
          // Expulsa o cliente de volta pra Home!
          this.router.navigate(['/']);
        }
      },
      error: () => {
        // Se der erro (ex: backend desligado ou caixa inexistente), expulsa também!
        this.router.navigate(['/']);
      },
    });
  }
}
