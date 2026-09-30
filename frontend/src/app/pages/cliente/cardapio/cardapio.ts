import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { CriarPedidoRequest, ItemPedidoRequest } from '../../../core/models/pedido.model';
import { Produto } from '../../../core/models/produto.model';
import { AuthService } from '../../../core/services/auth.service';
import { CaixaService } from '../../../core/services/caixa.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { ProdutoService } from '../../../core/services/produto.service';
import { WebsocketService } from '../../../core/services/websocket.service';

@Component({
  selector: 'app-cardapio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cardapio.html',
  styleUrls: ['./cardapio.css'],
})
export class CardapioComponent implements OnInit, OnDestroy {
  nomeCliente = '';
  tipoPedido: 'LEVAR' | 'COMER_AQUI' = 'COMER_AQUI';
  formaPagamento: 'PIX' | 'CARTAO' | 'DINHEIRO' = 'PIX';

  categorias: { id?: number; nome: string }[] = [{ nome: 'Todos' }];

  categoriaSelecionada?: number = undefined;

  produtos: Produto[] = [];

  carrinho: {
    produto: Produto;
    quantidade: number;
    observacao: string;
  }[] = [];

  isDono = false;
  jaPago = false;
  isProcessando = false;
  isCarrinhoAberto = false;
  tentouEnviar = false;

  // Estado da cozinha
  cozinhaDisponivel = false;

  private monitoramentoSubscription?: Subscription;

  constructor(
    private readonly produtoService: ProdutoService,
    private readonly pedidoService: PedidoService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly notificationService: NotificationService,
    private readonly authService: AuthService,
    private readonly caixaService: CaixaService,
    private readonly categoriaService: CategoriaService,
    private readonly websocketService: WebsocketService,
  ) {}

  ngOnInit(): void {
    // ---> NOVA LÓGICA REDIRECIONAMENTO IMEDIATO <---
    const pedidoAtivo = localStorage.getItem('filacerta_pedido_ativo');
    if (pedidoAtivo) {
      // Leva o cliente de volta pra fila instantaneamente, sem perguntar!
      this.router.navigate(['/cliente/acompanhamento', pedidoAtivo]);
      return; // Para a execução do cardápio aqui
    }

    // Código original mantido
    this.isDono = this.authService.isDono();

    this.carregarCategorias();
    this.carregarProdutos();

    // Começa a vigiar o caixa/cozinha
    this.iniciarMonitoramentoCaixa();
  }

  ngOnDestroy(): void {
    this.monitoramentoSubscription?.unsubscribe();
  }

  /**
   * Mantém o cardápio sincronizado com o caixa.
   *
   * Se o dono abrir/fechar/pausar/retomar,
   * o cliente percebe em até 5 segundos.
   */
  iniciarMonitoramentoCaixa(): void {
    // 1. Faz a primeira busca imediatamente ao abrir a tela
    this.atualizarStatusCaixa();

    // 2. Fica escutando o WebSocket. Só faz nova requisição quando o Java mandar!
    this.monitoramentoSubscription = this.websocketService.caixa$.subscribe(() => {
      this.atualizarStatusCaixa();
    });
  }

  // Novo método auxiliar para deixar o código limpo
  private atualizarStatusCaixa(): void {
    this.caixaService.buscarCaixaAtual().subscribe({
      next: (caixa) => {
        const disponivel = !!caixa && caixa.status === 'ABERTO' && caixa.cozinhaPausada !== true;
        const mudouEstado = this.cozinhaDisponivel !== disponivel;

        this.cozinhaDisponivel = disponivel;

        if (mudouEstado) {
          this.cdr.detectChanges();
        }

        if (!disponivel && this.carrinho.length > 0) {
          this.carrinho = [];
          this.isCarrinhoAberto = false;
          this.notificationService.aviso(
            'Cozinha indisponível',
            'A cozinha foi pausada ou o caixa foi encerrado. Seu carrinho foi limpo.',
          );
        }

        if (!disponivel) {
          this.router.navigate(['/']);
        }
      },
      error: (err) => console.error('Erro ao verificar disponibilidade da cozinha', err),
    });
  }

  carregarCategorias(): void {
    this.categoriaService.listarTodas().subscribe({
      next: (dados) => {
        this.categorias = [{ nome: 'Todos' }, ...dados];

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Erro ao buscar categorias', err);
      },
    });
  }

  filtrarPorCategoria(id?: number): void {
    if (this.categoriaSelecionada === id) {
      return;
    }

    this.categoriaSelecionada = id;
    this.produtos = [];

    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.produtoService.listar(this.categoriaSelecionada).subscribe({
      next: (data) => {
        // Trava de segurança: se vier undefined, assume array vazio []
        this.produtos = data || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar produtos', err);
        this.produtos = []; // Garante que a tela não quebre no erro
        this.cdr.detectChanges();
      },
    });
  }

  adicionarItem(produto: Produto): void {
    if (!this.cozinhaDisponivel) {
      this.notificationService.aviso('Cozinha indisponível', 'A cozinha está pausada no momento.');
      return;
    }

    // NOVA TRAVA: Verifica a chave de disponibilidade manual
    if (!produto.disponivel) {
      this.notificationService.aviso('Pausado', 'Este item não está disponível no momento.');
      return;
    }

    if (produto.quantidadeDisponivel === 0) {
      this.notificationService.aviso('Esgotado', 'Poxa, este item acabou agora mesmo!');
      return;
    }

    const itemExistente = this.carrinho.find((item) => item.produto.id === produto.id);

    const qtdAtual = itemExistente ? itemExistente.quantidade : 0;

    if (
      produto.quantidadeDisponivel !== undefined &&
      produto.quantidadeDisponivel !== null &&
      qtdAtual >= produto.quantidadeDisponivel
    ) {
      this.notificationService.aviso(
        'Limite Atingido',
        `Temos apenas ${produto.quantidadeDisponivel} unidades disponíveis no momento.`,
      );

      return;
    }

    if (itemExistente) {
      itemExistente.quantidade++;
    } else {
      this.carrinho.push({
        produto,
        quantidade: 1,
        observacao: '',
      });
    }
  }

  removerItem(produto: Produto): void {
    const index = this.carrinho.findIndex((item) => item.produto.id === produto.id);

    if (index === -1) {
      return;
    }

    if (this.carrinho[index].quantidade <= 1) {
      this.carrinho.splice(index, 1);
    } else {
      this.carrinho[index].quantidade--;
    }
  }

  getQuantidade(produto: Produto): number {
    const item = this.carrinho.find((i) => i.produto.id === produto.id);

    return item ? item.quantidade : 0;
  }

  get totalItens(): number {
    return this.carrinho.reduce((acc, item) => acc + item.quantidade, 0);
  }

  get total(): number {
    return this.carrinho.reduce((acc, item) => acc + item.produto.preco * item.quantidade, 0);
  }

  /**
   * CORRIGIDO.
   *
   * carrinho já é um array.
   * Não precisa fazer find dentro de produtos.
   */
  getItensCarrinho(): {
    produto: Produto;
    quantidade: number;
    observacao: string;
  }[] {
    return this.carrinho;
  }

  podeEnviar(): boolean {
    return (
      this.cozinhaDisponivel &&
      this.nomeCliente.trim().length >= 2 &&
      this.carrinho.length > 0 &&
      !this.isProcessando
    );
  }

  enviarPedido(): void {
    // Segurança extra: verifica novamente antes de enviar
    if (!this.cozinhaDisponivel) {
      this.notificationService.aviso(
        'Cozinha indisponível',
        'A cozinha foi pausada. Não é possível enviar o pedido.',
      );
      return;
    }

    if (this.carrinho.length === 0) {
      return;
    }

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

    const itens: ItemPedidoRequest[] = this.carrinho.map((item) => ({
      produtoId: item.produto.id,
      quantidade: item.quantidade,
      observacaoItem: item.observacao.trim() || undefined,
    }));

    const request: CriarPedidoRequest = {
      nomeCliente: this.nomeCliente.trim(),
      tipo: this.tipoPedido,
      origem: this.isDono ? 'MANUAL' : 'QR_CODE',
      formaPagamento: this.formaPagamento,
      statusPagamento: this.isDono ? (this.jaPago ? 'PAGO' : 'AGUARDANDO') : 'AGUARDANDO',
      itens,
    };

    this.pedidoService.criarPedido(request).subscribe({
      next: (response) => {
        // ---> MUDANÇA AQUI: SALVA O CÓDIGO SEGURO NO APARELHO <---
        if (response.codigoAcompanhamento) {
          localStorage.setItem('filacerta_pedido_ativo', response.codigoAcompanhamento);
        }

        this.carrinho = [];
        this.nomeCliente = '';
        this.isProcessando = false;
        this.isCarrinhoAberto = false;

        // ---> MUDANÇA AQUI: NAVEGA USANDO O CÓDIGO EM VEZ DO ID <---
        this.router.navigate(['/cliente/acompanhamento', response.codigoAcompanhamento]);
      },

      error: (err) => {
        // Tratamento de erros fantástico original mantido...
        console.error('Status do Erro:', err.status);
        console.log('Corpo do Erro (Payload):', err.error);

        let mensagemDoBackend = 'O pedido não pôde ser enviado. Tente novamente.';
        let tituloDoBackend = 'Erro no Pedido';

        if (err.error) {
          try {
            const erroFormatado = typeof err.error === 'string' ? JSON.parse(err.error) : err.error;
            if (erroFormatado?.mensagem) {
              mensagemDoBackend = erroFormatado.mensagem;
            }
            if (erroFormatado?.erro) {
              tituloDoBackend = erroFormatado.erro;
            }
          } catch (e) {
            console.error('Falha ao tentar ler o JSON do erro:', e);
          }
        }

        this.notificationService.erro(tituloDoBackend, mensagemDoBackend);
        this.isProcessando = false;
        this.cdr.detectChanges();
      },
    });
  }

  abrirCarrinho(): void {
    if (!this.cozinhaDisponivel) {
      this.notificationService.aviso('Cozinha indisponível', 'A cozinha está pausada no momento.');

      return;
    }

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

  permiteObservacao(produto: Produto): boolean {
    const categoriasBloqueadas = ['Bebidas', 'Acompanhamentos', 'Sobremesas'];

    // Pega o nome vindo do objeto novo, ou o texto antigo
    const nomeCategoria = produto.categoria?.nome || produto.categoria;

    return !categoriasBloqueadas.includes(nomeCategoria);
  }
}
