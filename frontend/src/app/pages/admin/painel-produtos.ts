import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { Produto } from '../../core/models/produto.model';
import { CategoriaService } from '../../core/services/categoria.service';
import { ModalService } from '../../core/services/modal.service';
import { NotificationService } from '../../core/services/notification.service';
import { ProdutoService } from '../../core/services/produto.service';

@Component({
  selector: 'app-painel-produtos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './painel-produtos.html',
})
export class PainelProdutosComponent implements OnInit {
  private readonly produtoService = inject(ProdutoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly notificationService = inject(NotificationService);
  private readonly modalService = inject(ModalService);
  private readonly destroyRef = inject(DestroyRef);

  // === Signals de Estado ===
  readonly produtos = signal<Produto[]>([]);
  readonly categorias = signal<any[]>([]);
  readonly isProcessando = signal(false);

  // === Signals do Modal/Formulário ===
  readonly isModalAberto = signal(false);
  readonly modoEdicao = signal(false);

  // Objeto base para o formulário
  // 1. Atualize o form base
  produtoForm = signal<any>({
    nome: '',
    descricao: '',
    preco: 0,
    categoriaId: null,
    tempoPreparoMinutos: 0,
    disponivel: true,
    quantidadeDisponivel: null,
    versao: 0, // <--- NOVO
  });

  private produtoIdEditando: number | null = null;

  ngOnInit(): void {
    this.carregarCategorias();
    this.carregarProdutos();
  }

  carregarCategorias(): void {
    this.categoriaService
      .listarTodas()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cats) => this.categorias.set(cats),
        error: () =>
          this.notificationService.erro('Erro', 'Não foi possível carregar as categorias.'),
      });
  }

  carregarProdutos(): void {
    this.produtoService
      .listar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (prods) => this.produtos.set(prods),
        error: () =>
          this.notificationService.erro('Erro', 'Não foi possível carregar os produtos.'),
      });
  }

  // === Controle do Modal ===
  abrirModalNovo(): void {
    this.modoEdicao.set(false);
    this.produtoIdEditando = null;
    this.produtoForm.set({
      nome: '',
      descricao: '',
      preco: null,
      categoriaId: null,
      tempoPreparoMinutos: 5,
      disponivel: true,
      quantidadeDisponivel: null,
    });
    this.isModalAberto.set(true);
  }

  abrirModalEdicao(produto: Produto): void {
    this.modoEdicao.set(true);
    this.produtoIdEditando = produto.id;
    this.produtoForm.set({
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
      categoriaId: produto.categoria?.id || produto.categoriaId,
      tempoPreparoMinutos: produto.tempoPreparoMinutos,
      disponivel: produto.disponivel,
      quantidadeDisponivel: produto.quantidadeDisponivel,
      versao: produto.versao, // <--- NOVO
    });
    this.isModalAberto.set(true);
  }

  fecharModal(): void {
    this.isModalAberto.set(false);
  }

  // === Operações de CRUD ===
  salvarProduto(): void {
    const form = this.produtoForm();
    if (!form.nome || !form.preco || !form.categoriaId) {
      this.notificationService.aviso('Campos Inválidos', 'Preencha o Nome, Preço e Categoria.');
      return;
    }

    this.isProcessando.set(true);

    const requisicao$ = this.modoEdicao()
      ? this.produtoService.atualizar(this.produtoIdEditando!, form)
      : this.produtoService.criar(form);

    requisicao$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isProcessando.set(false)),
      )
      .subscribe({
        next: () => {
          this.notificationService.sucesso(
            'Sucesso!',
            `Produto ${this.modoEdicao() ? 'atualizado' : 'cadastrado'} com sucesso.`,
          );
          this.carregarProdutos();
          this.fecharModal();
        },
        error: () => this.notificationService.erro('Erro', 'Falha ao salvar produto.'),
      });
  }

  excluirProduto(produto: Produto): void {
    this.modalService.abrir({
      titulo: 'Inativar Produto?',
      mensagem: `Tem certeza que deseja inativar "${produto.nome}"? Ele sumirá do cardápio para os clientes.`,
      tipo: 'perigo',
      textoConfirmar: 'Sim, inativar',
      textoCancelar: 'Cancelar',
      onConfirm: () => {
        this.produtoService
          .inativar(produto.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.notificationService.sucesso('Excluído', 'Produto inativado com sucesso.');
              this.carregarProdutos();
            },
            error: () =>
              this.notificationService.erro('Erro', 'Não foi possível inativar o produto.'),
          });
      },
    });
  }

  alternarDisponibilidade(produto: Produto): void {
    const formAtualizado = {
      nome: produto.nome,
      descricao: produto.descricao || '',
      preco: produto.preco,
      categoriaId: produto.categoria?.id || produto.categoriaId || 1,
      tempoPreparoMinutos: produto.tempoPreparoMinutos || 0,
      quantidadeDisponivel: produto.quantidadeDisponivel,

      // INVERTE A DISPONIBILIDADE
      disponivel: !produto.disponivel,

      versao: produto.versao || 0,
    };

    this.produtoService
      .atualizar(produto.id, formAtualizado)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          // Agora ele te avisa que salvou no banco!
          this.notificationService.sucesso(
            'Estoque Atualizado',
            `O produto "${produto.nome}" agora está ${formAtualizado.disponivel ? 'Disponível' : 'Pausado'}.`,
          );
          this.carregarProdutos();
        },
        error: () => {
          this.notificationService.erro('Erro', 'Não foi possível alterar a disponibilidade.');
          // Se der erro, recarrega a lista para forçar o botão a voltar pro estado real do banco
          this.carregarProdutos();
        },
      });
  }
}
