import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  isModoEdicao = false;
  isProcessando = false;
  isCarrinhoAberto = false;
  tentouEnviar = false;
  cozinhaDisponivel = false;

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

  ngOnInit(): void {
    const pedidoAtivo = localStorage.getItem('filacerta_pedido_ativo');

    // ---> CORREÇÃO AQUI: Se não tem pedido, garante que não está em modo edição
    if (!pedidoAtivo) {
      sessionStorage.removeItem('filacerta_modo_edicao');
    }

    const modoEdicao = sessionStorage.getItem('filacerta_modo_edicao');
    this.isModoEdicao = !!modoEdicao;

    // Se tem pedido ativo, mas NÃO está no modo edição, expulsa pra fila!
    if (pedidoAtivo && !modoEdicao) {
      this.router.navigate(['/cliente/acompanhamento', pedidoAtivo]);
      return;
    }

    // Se ele está editando, carrega os lanches e vigia a cozinha!
    if (pedidoAtivo && modoEdicao) {
      this.carregarCarrinhoParaEdicao(pedidoAtivo);
      this.iniciarMonitoramentoPedido(pedidoAtivo);
    }

    this.isDono = this.authService.isDono();
    this.carregarCategorias();
    this.carregarProdutos();
    this.iniciarMonitoramentoCaixa();
  }

  ngOnDestroy(): void {
    this.monitoramentoSubscription?.unsubscribe();
    this.pedidoSubscription?.unsubscribe();
  }

  private carregarCarrinhoParaEdicao(codigo: string): void {
    this.pedidoService.acompanharPedido(codigo).subscribe({
      next: (pedidoAntigo) => {
        this.nomeCliente = pedidoAntigo.nomeCliente;
        this.tipoPedido = pedidoAntigo.tipo as any;
        this.formaPagamento = pedidoAntigo.formaPagamento as any;

        // Reconstrói o carrinho convertendo os itens do DTO em itens visuais
        this.carrinho = pedidoAntigo.itens.map((item) => ({
          produto: {
            id: item.produtoId,
            nome: item.nomeProduto,
            preco: item.precoUnitario,
            disponivel: true, // Mock para a tela não quebrar
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

  iniciarMonitoramentoCaixa(): void {
    this.atualizarStatusCaixa();
    this.monitoramentoSubscription = this.websocketService.caixa$.subscribe(() => {
      this.atualizarStatusCaixa();
    });
  }

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
      error: (err) => console.error('Erro ao verificar disponibilidade', err),
    });
  }

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
    this.produtoService.listar(this.categoriaSelecionada).subscribe({
      next: (data) => {
        this.produtos = data || [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.produtos = [];
        this.cdr.detectChanges();
      },
    });
  }

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
  }

  removerItem(produto: Produto): void {
    const index = this.carrinho.findIndex((item) => item.produto.id === produto.id);
    if (index === -1) return;

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

  getItensCarrinho(): { produto: Produto; quantidade: number; observacao: string }[] {
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
    const codigoAtivo = localStorage.getItem('filacerta_pedido_ativo');

    // MODO EDIÇÃO (PUT)
    if (modoEdicao && codigoAtivo) {
      const updateRequest: AtualizarPedidoRequest = { itens };

      this.pedidoService.atualizarPedido(codigoAtivo, updateRequest).subscribe({
        next: (response) => {
          sessionStorage.removeItem('filacerta_modo_edicao');
          this.finalizarEnvio(response.codigoAcompanhamento);
        },
        error: (err) => this.tratarErroBackend(err),
      });

      // MODO NOVO PEDIDO (POST)
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
          if (response.codigoAcompanhamento) {
            localStorage.setItem('filacerta_pedido_ativo', response.codigoAcompanhamento);
          }
          this.finalizarEnvio(response.codigoAcompanhamento);
        },
        error: (err) => this.tratarErroBackend(err),
      });
    }
  }

  // --- MÉTODOS AUXILIARES PARA LIMPAR O CÓDIGO ---

  private finalizarEnvio(codigoAcompanhamento: string): void {
    this.carrinho = [];
    this.nomeCliente = '';
    this.isProcessando = false;
    this.isCarrinhoAberto = false;
    this.router.navigate(['/cliente/acompanhamento', codigoAcompanhamento]);
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
    // Se o cliente tentou salvar, deu erro e ele estava editando, expulsa pra rua!
    const modoEdicao = sessionStorage.getItem('filacerta_modo_edicao');
    const codigoAtivo = localStorage.getItem('filacerta_pedido_ativo');

    if (modoEdicao && codigoAtivo) {
      sessionStorage.removeItem('filacerta_modo_edicao');
      this.router.navigate(['/cliente/acompanhamento', codigoAtivo]);
    }
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
    const nomeCategoria = produto.categoria?.nome || produto.categoria;
    return !categoriasBloqueadas.includes(nomeCategoria as string);
  }

  private iniciarMonitoramentoPedido(codigo: string): void {
    // Toda a vez que a cozinha mexer num pedido, o WebSocket apita
    this.pedidoSubscription = this.websocketService.pedidos$.subscribe(() => {
      // Vamos verificar como está o nosso pedido
      this.pedidoService.acompanharPedido(codigo).subscribe({
        next: (pedidoAtualizado) => {
          // Se a cozinha cancelou ou começou a preparar, expulsa da edição!
          if (pedidoAtualizado.status !== 'RECEBIDO') {
            this.notificationService.aviso(
              'Edição Encerrada',
              'O status do seu pedido mudou na cozinha. Não é mais possível editar.',
            );

            sessionStorage.removeItem('filacerta_modo_edicao'); // Tira o crachá
            this.router.navigate(['/cliente/acompanhamento', codigo]); // Leva para a tela de rastreio
          }
        },
        error: (err) => {
          // Se o pedido foi apagado da base de dados, limpa tudo e joga para a Home
          if (err.status === 404 || err.status === 400 || err.status === 500) {
            sessionStorage.removeItem('filacerta_modo_edicao');
            localStorage.removeItem('filacerta_pedido_ativo');
            this.router.navigate(['/']);
          }
        },
      });
    });
  }
}
