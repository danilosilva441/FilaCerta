import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import {
  AtualizarPedidoRequest,
  CriarPedidoRequest,
  ItemPedidoRequest,
} from '../../../core/models/pedido.model';
import { Produto } from '../../../core/models/produto.model';
import { AuthService } from '../../../core/services/auth.service';
import { CaixaService } from '../../../core/services/caixa.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { ProdutoService } from '../../../core/services/produto.service';
import { WebsocketService } from '../../../core/services/websocket.service';

interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
  observacao: string;
}

@Component({
  selector: 'app-cardapio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cardapio.html',
  styleUrls: ['./cardapio.css'],
})
export class CardapioComponent implements OnInit, OnDestroy {
  // ---------- Cardápio ----------
  categorias: { id?: number; nome: string }[] = [{ nome: 'Todos' }];
  categoriaSelecionada?: number = undefined;
  produtos: Produto[] = [];
  carregandoProdutos = true;
  termoBusca = '';
  readonly skeletons = [1, 2, 3];

  // ---------- Carrinho ----------
  carrinho: ItemCarrinho[] = [];
  isCarrinhoAberto = false;
  etapaAtual: 1 | 2 = 1;
  tentouEnviar = false;

  // ---------- Identificação ----------
  nomeCliente = '';
  tipoPedido: 'LEVAR' | 'COMER_AQUI' = 'COMER_AQUI';
  formaPagamento: 'PIX' | 'CARTAO' | 'DINHEIRO' = 'PIX';

  // ---------- Contexto ----------
  isDono = false;
  jaPago = false;
  isModoEdicao = false;
  isModoAcrescimo = false;
  isProcessando = false;
  cozinhaDisponivel = false;

  @ViewChild('campoNome') campoNome?: ElementRef<HTMLInputElement>;

  private readonly CHAVE_RASCUNHO = 'filacerta_rascunho_pedido';
  private readonly VALIDADE_RASCUNHO_MS = 6 * 60 * 60 * 1000; // 6h

  private monitoramentoSubscription?: Subscription;
  private pedidoSubscription?: Subscription;

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

  // ============================================================
  // CICLO DE VIDA
  // ============================================================
  ngOnInit(): void {
    // 1. Descobre se quem abriu o cardápio é o dono
    this.isDono = this.authService.isDono();

    const pedidoAtivo = localStorage.getItem('filacerta_pedido_ativo');

    // Sem pedido ativo: rasga os crachás antigos
    if (!pedidoAtivo) {
      sessionStorage.removeItem('filacerta_modo_edicao');
      sessionStorage.removeItem('filacerta_modo_acrescimo');
    }

    const modoEdicao = sessionStorage.getItem('filacerta_modo_edicao');
    const modoAcrescimo = sessionStorage.getItem('filacerta_modo_acrescimo');

    this.isModoEdicao = !!modoEdicao;
    this.isModoAcrescimo = !!modoAcrescimo;

    // Cliente com pedido em andamento e sem intenção de editar → vai para a fila
    if (pedidoAtivo && !modoEdicao && !modoAcrescimo && !this.isDono) {
      void this.router.navigate(['/cliente/acompanhamento', pedidoAtivo]);
      return;
    }

    // Dono com lixo na memória → limpa em silêncio
    if (this.isDono && pedidoAtivo && !modoEdicao && !modoAcrescimo) {
      localStorage.removeItem('filacerta_pedido_ativo');
    }

    if (pedidoAtivo && modoEdicao) {
      this.carregarCarrinhoParaEdicao(pedidoAtivo);
      this.iniciarMonitoramentoPedido(pedidoAtivo);
    } else if (pedidoAtivo && modoAcrescimo) {
      this.prepararAcrescimo(pedidoAtivo);
      this.iniciarMonitoramentoPedido(pedidoAtivo);
    } else if (!this.isDono) {
      this.restaurarRascunho();
    }

    this.carregarCategorias();
    this.carregarProdutos();
    this.iniciarMonitoramentoCaixa();
  }

  ngOnDestroy(): void {
    this.monitoramentoSubscription?.unsubscribe();
    this.pedidoSubscription?.unsubscribe();
  }

  // ============================================================
  // MODO EDIÇÃO / ACRÉSCIMO
  // ============================================================
  private carregarCarrinhoParaEdicao(codigo: string): void {
    this.pedidoService.acompanharPedido(codigo).subscribe({
      next: (pedidoAntigo) => {
        this.nomeCliente = pedidoAntigo.nomeCliente;
        this.tipoPedido = pedidoAntigo.tipo as any;
        this.formaPagamento = pedidoAntigo.formaPagamento as any;

        this.carrinho = pedidoAntigo.itens.map((item) => ({
          produto: {
            id: item.produtoId,
            nome: item.nomeProduto,
            preco: item.precoUnitario,
            disponivel: true,
            descricao: '',
          } as Produto,
          quantidade: item.quantidade,
          observacao: item.observacaoItem || '',
        }));

        this.notificationService.sucesso(
          'Modo Edição',
          'Seu pedido foi carregado. Adicione ou remova itens à vontade!',
        );
        this.cdr.detectChanges();
      },
      error: () => {
        sessionStorage.removeItem('filacerta_modo_edicao');
        localStorage.removeItem('filacerta_pedido_ativo');
      },
    });
  }

  private prepararAcrescimo(codigo: string): void {
    this.pedidoService.acompanharPedido(codigo).subscribe({
      next: (pedidoAntigo) => {
        this.nomeCliente = pedidoAntigo.nomeCliente;
        this.tipoPedido = pedidoAntigo.tipo as any;
        this.formaPagamento = pedidoAntigo.formaPagamento as any;

        // Carrinho fica vazio de propósito: aqui só entram os itens novos

        this.notificationService.sucesso(
          'Conta Aberta',
          'Escolha o que deseja adicionar à sua mesa!',
        );
        this.cdr.detectChanges();
      },
      error: () => {
        sessionStorage.removeItem('filacerta_modo_acrescimo');
        localStorage.removeItem('filacerta_pedido_ativo');
        void this.router.navigate(['/']);
      },
    });
  }

  // ============================================================
  // CAIXA / DISPONIBILIDADE
  // ============================================================
  iniciarMonitoramentoCaixa(): void {
    this.atualizarStatusCaixa();
    this.monitoramentoSubscription = this.websocketService.caixa$.subscribe(() => {
      this.atualizarStatusCaixa();
    });
  }

  private atualizarStatusCaixa(): void {
    this.caixaService.buscarCaixaAtual().subscribe({
      next: (caixa) => {
        const isDono = this.authService.isDono();

        const disponivel =
          isDono || (!!caixa && caixa.status === 'ABERTO' && caixa.cozinhaPausada !== true);

        const mudouEstado = this.cozinhaDisponivel !== disponivel;
        this.cozinhaDisponivel = disponivel;

        if (mudouEstado) {
          this.cdr.detectChanges();
        }

        if (!disponivel && this.carrinho.length > 0) {
          this.carrinho = [];
          this.isCarrinhoAberto = false;
          this.limparRascunho();
          this.notificationService.aviso(
            'Cozinha indisponível',
            'A cozinha foi pausada ou o caixa foi encerrado. Seu carrinho foi limpo.',
          );
        }

        if (!disponivel) {
          void this.router.navigate(['/']);
        }
      },
      error: (err) => console.error('Erro ao verificar disponibilidade', err),
    });
  }

  // ============================================================
  // CATEGORIAS E PRODUTOS
  // ============================================================
  carregarCategorias(): void {
    this.categoriaService.listarTodas().subscribe({
      next: (dados) => {
        this.categorias = [{ nome: 'Todos' }, ...dados];
        this.cdr.detectChanges();
      },
    });
  }

  filtrarPorCategoria(id?: number): void {
    if (this.categoriaSelecionada === id) return;
    this.categoriaSelecionada = id;
    this.produtos = [];
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.carregandoProdutos = true;
    this.produtoService.listar(this.categoriaSelecionada).subscribe({
      next: (data) => {
        this.produtos = data || [];
        this.reconciliarCarrinho();
        this.carregandoProdutos = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.produtos = [];
        this.carregandoProdutos = false;
        this.cdr.detectChanges();
      },
    });
  }

  /**
   * Atualiza preço/disponibilidade dos itens do carrinho com os dados frescos
   * da API. Evita carrinho restaurado com preço antigo.
   */
  private reconciliarCarrinho(): void {
    if (this.carrinho.length === 0) return;

    this.carrinho = this.carrinho.map((item) => {
      const atual = this.produtos.find((p) => p.id === item.produto.id);
      return atual ? { ...item, produto: atual } : item;
    });
  }

  // ============================================================
  // BUSCA
  // ============================================================
  private normalizar(texto: string): string {
    return (texto ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  get produtosFiltrados(): Produto[] {
    const termo = this.normalizar(this.termoBusca);
    if (!termo) return this.produtos;
    return this.produtos.filter(
      (p) =>
        this.normalizar(p.nome).includes(termo) ||
        this.normalizar(p.descricao ?? '').includes(termo),
    );
  }

  // ============================================================
  // CARRINHO
  // ============================================================
  adicionarItem(produto: Produto): void {
    if (!this.cozinhaDisponivel) {
      this.notificationService.aviso('Cozinha indisponível', 'A cozinha está pausada no momento.');
      return;
    }

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
      this.carrinho.push({ produto, quantidade: 1, observacao: '' });
    }

    this.salvarRascunho();
  }

  removerItem(produto: Produto): void {
    const index = this.carrinho.findIndex((item) => item.produto.id === produto.id);
    if (index === -1) return;

    if (this.carrinho[index].quantidade <= 1) {
      this.carrinho.splice(index, 1);
    } else {
      this.carrinho[index].quantidade--;
    }

    this.salvarRascunho();

    // Carrinho esvaziou com o modal aberto: fecha para não ficar tela morta
    if (this.carrinho.length === 0 && this.isCarrinhoAberto) {
      this.fecharCarrinho();
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

  getItensCarrinho(): ItemCarrinho[] {
    return this.carrinho;
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
    this.etapaAtual = 1;
  }

  fecharCarrinho(): void {
    this.isCarrinhoAberto = false;
    this.tentouEnviar = false;
    this.etapaAtual = 1;
  }

  permiteObservacao(produto: Produto): boolean {
    const categoriasBloqueadas = ['Bebidas', 'Acompanhamentos', 'Sobremesas'];
    const nomeCategoria = produto.categoria?.nome || produto.categoria;
    return !categoriasBloqueadas.includes(nomeCategoria as string);
  }

  // ============================================================
  // WIZARD
  // ============================================================
  proximaEtapa(): void {
    if (this.etapaAtual !== 1) return;

    this.etapaAtual = 2;

    if (!this.nomeCliente.trim()) {
      this.cdr.detectChanges();
      setTimeout(() => this.campoNome?.nativeElement.focus(), 50);
    }
  }

  voltarEtapa(): void {
    if (this.etapaAtual === 2) {
      this.etapaAtual = 1;
    }
  }

  // ============================================================
  // ENVIO DO PEDIDO
  // ============================================================
  podeEnviar(): boolean {
    return (
      this.cozinhaDisponivel &&
      this.nomeCliente.trim().length >= 2 &&
      this.carrinho.length > 0 &&
      !this.isProcessando
    );
  }

  enviarPedido(): void {
    if (!this.podeEnviar()) {
      this.tentouEnviar = true;
      if (!this.nomeCliente || this.nomeCliente.trim() === '') {
        this.notificationService.aviso(
          'Atenção',
          'Por favor, informe seu nome para chamarmos quando estiver pronto!',
        );
      }
      return;
    }

    this.isProcessando = true;
    this.tentouEnviar = false;

    const itens: ItemPedidoRequest[] = this.carrinho.map((item) => ({
      produtoId: item.produto.id,
      quantidade: item.quantidade,
      observacaoItem: item.observacao.trim() || undefined,
    }));

    const modoEdicao = sessionStorage.getItem('filacerta_modo_edicao');
    const modoAcrescimo = sessionStorage.getItem('filacerta_modo_acrescimo');
    const codigoAtivo = localStorage.getItem('filacerta_pedido_ativo');

    // 1. MODO EDIÇÃO (PUT) — substitui os itens
    if (modoEdicao && codigoAtivo) {
      const updateRequest: AtualizarPedidoRequest = { itens };

      this.pedidoService.atualizarPedido(codigoAtivo, updateRequest).subscribe({
        next: (response) => {
          sessionStorage.removeItem('filacerta_modo_edicao');
          this.finalizarEnvio(response.codigoAcompanhamento);
        },
        error: (err) => this.tratarErroBackend(err),
      });

      // 2. MODO ACRÉSCIMO (POST) — soma novos itens à conta existente
    } else if (modoAcrescimo && codigoAtivo) {
      const addRequest: AtualizarPedidoRequest = { itens };

      this.pedidoService.adicionarItensAoPedido(codigoAtivo, addRequest).subscribe({
        next: (response) => {
          sessionStorage.removeItem('filacerta_modo_acrescimo');
          this.finalizarEnvio(response.codigoAcompanhamento);
        },
        error: (err) => this.tratarErroBackend(err),
      });

      // 3. MODO NOVO PEDIDO (POST)
    } else {
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
          // Só amarra o aparelho ao pedido se NÃO for o dono
          if (response.codigoAcompanhamento && !this.isDono) {
            localStorage.setItem('filacerta_pedido_ativo', response.codigoAcompanhamento);
          }

          this.finalizarEnvio(response.codigoAcompanhamento);
        },
        error: (err) => this.tratarErroBackend(err),
      });
    }
  }

  private finalizarEnvio(codigoAcompanhamento: string): void {
    this.carrinho = [];
    this.nomeCliente = '';
    this.isProcessando = false;
    this.isCarrinhoAberto = false;
    this.etapaAtual = 1;
    this.limparRascunho();

    // Logado (tem token) → cozinha. Cliente → acompanhamento.
    if (this.authService.isLogado()) {
      void this.router.navigate(['/cozinha/painel']);
    } else {
      void this.router.navigate(['/cliente/acompanhamento', codigoAcompanhamento]);
    }
  }

  private tratarErroBackend(err: any): void {
    let mensagemDoBackend = 'O pedido não pôde ser enviado. Tente novamente.';
    let tituloDoBackend = 'Erro no Pedido';

    if (err.error) {
      try {
        const erroFormatado = typeof err.error === 'string' ? JSON.parse(err.error) : err.error;
        if (erroFormatado?.mensagem) mensagemDoBackend = erroFormatado.mensagem;
        if (erroFormatado?.erro) tituloDoBackend = erroFormatado.erro;
      } catch (e) {
        console.error('Falha ao tentar ler o JSON do erro:', e);
      }
    }

    this.notificationService.erro(tituloDoBackend, mensagemDoBackend);
    this.isProcessando = false;
    this.cdr.detectChanges();

    // Erro ao salvar edição: devolve o cliente para o acompanhamento
    const modoEdicao = sessionStorage.getItem('filacerta_modo_edicao');
    const codigoAtivo = localStorage.getItem('filacerta_pedido_ativo');

    if (modoEdicao && codigoAtivo) {
      sessionStorage.removeItem('filacerta_modo_edicao');
      void this.router.navigate(['/cliente/acompanhamento', codigoAtivo]);
    }
  }

  // ============================================================
  // MONITORAMENTO DO PEDIDO (WEBSOCKET)
  // ============================================================
  private iniciarMonitoramentoPedido(codigo: string): void {
    this.pedidoSubscription = this.websocketService.pedidos$.subscribe(() => {
      this.pedidoService.acompanharPedido(codigo).subscribe({
        next: (pedidoAtualizado) => {
          // REGRA 1 (EDIÇÃO): cozinha já começou → não pode mais editar
          if (this.isModoEdicao && pedidoAtualizado.status !== 'RECEBIDO') {
            this.notificationService.aviso(
              'Edição Encerrada',
              'O status do seu pedido mudou na cozinha. Não é mais possível editar.',
            );
            sessionStorage.removeItem('filacerta_modo_edicao');
            void this.router.navigate(['/cliente/acompanhamento', codigo]);
          }

          // REGRA 2 (ACRÉSCIMO): só trava quando o caixa fecha a conta
          if (
            this.isModoAcrescimo &&
            (pedidoAtualizado.status === 'ENTREGUE' || pedidoAtualizado.status === 'CANCELADO')
          ) {
            this.notificationService.aviso(
              'Conta Encerrada',
              'Esta conta já foi finalizada pelo caixa.',
            );
            sessionStorage.removeItem('filacerta_modo_acrescimo');
            void this.router.navigate(['/cliente/acompanhamento', codigo]);
          }
        },
        error: (err) => {
          if (err.status === 404 || err.status === 400 || err.status === 500) {
            sessionStorage.removeItem('filacerta_modo_edicao');
            sessionStorage.removeItem('filacerta_modo_acrescimo');
            localStorage.removeItem('filacerta_pedido_ativo');
            void this.router.navigate(['/']);
          }
        },
      });
    });
  }

  // ============================================================
  // RASCUNHO (localStorage)
  // ============================================================
  salvarRascunho(): void {
    if (this.isDono || this.isModoEdicao || this.isModoAcrescimo) return;

    if (this.carrinho.length === 0 && !this.nomeCliente.trim()) {
      localStorage.removeItem(this.CHAVE_RASCUNHO);
      return;
    }

    localStorage.setItem(
      this.CHAVE_RASCUNHO,
      JSON.stringify({
        nomeCliente: this.nomeCliente,
        tipoPedido: this.tipoPedido,
        carrinho: this.carrinho,
        salvoEm: Date.now(),
      }),
    );
  }

  private restaurarRascunho(): void {
    const bruto = localStorage.getItem(this.CHAVE_RASCUNHO);
    if (!bruto) return;

    try {
      const r = JSON.parse(bruto);

      if (!r?.salvoEm || Date.now() - r.salvoEm > this.VALIDADE_RASCUNHO_MS) {
        this.limparRascunho();
        return;
      }

      this.nomeCliente = r.nomeCliente ?? '';
      this.tipoPedido = r.tipoPedido ?? 'COMER_AQUI';
      this.carrinho = Array.isArray(r.carrinho) ? r.carrinho : [];
    } catch {
      this.limparRascunho();
    }
  }

  private limparRascunho(): void {
    localStorage.removeItem(this.CHAVE_RASCUNHO);
  }
}
