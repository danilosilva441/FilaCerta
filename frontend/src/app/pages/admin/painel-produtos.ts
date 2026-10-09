import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
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
  styleUrls: ['./painel-produtos.css'],
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
    versao: 0,
  });

  private produtoIdEditando: number | null = null;

  // ==========================================
  // FILTROS E PESQUISA (Com reatividade moderna)
  // ==========================================
  termoPesquisa = signal<string>('');
  categoriaSelecionada = signal<number | null>(null);
  // ==========================================
  // CONTROLE DO MODAL DE CATEGORIAS
  // ==========================================
  readonly isModalCategoriaAberto = signal(false);
  readonly isProcessandoCategoria = signal(false);
  categoriaForm = signal<{ id: number | null; nome: string }>({ id: null, nome: '' });

  abrirModalCategorias(): void {
    this.categoriaForm.set({ id: null, nome: '' });
    this.isModalCategoriaAberto.set(true);
  }

  fecharModalCategorias(): void {
    this.isModalCategoriaAberto.set(false);
  }

  editarCategoria(cat: any): void {
    this.categoriaForm.set({ id: cat.id, nome: cat.nome });
  }

  cancelarEdicaoCategoria(): void {
    this.categoriaForm.set({ id: null, nome: '' });
  }

  salvarCategoria(): void {
    const form = this.categoriaForm();
    if (!form.nome || form.nome.trim() === '') {
      this.notificationService.aviso('Atenção', 'O nome da categoria não pode ser vazio.');
      return;
    }

    this.isProcessandoCategoria.set(true);
    const requisicao$ = form.id
      ? this.categoriaService.atualizar(form.id, { nome: form.nome })
      : this.categoriaService.criar({ nome: form.nome });

    requisicao$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isProcessandoCategoria.set(false)),
      )
      .subscribe({
        next: () => {
          this.notificationService.sucesso('Sucesso', 'Categoria salva com sucesso!');
          this.carregarCategorias(); // Recarrega a lista de categorias

          this.carregarProdutos(); // Recarrega os produtos para que peguem o novo nome da categoria!

          this.cancelarEdicaoCategoria();
        },
        error: () => this.notificationService.erro('Erro', 'Falha ao salvar a categoria.'),
      });
  }

  excluirCategoria(cat: any): void {
    this.modalService.abrir({
      titulo: 'Excluir Categoria?',
      mensagem: `Tem certeza que deseja excluir "${cat.nome}"?`,
      tipo: 'perigo',
      textoConfirmar: 'Sim, excluir',
      textoCancelar: 'Cancelar',
      onConfirm: () => {
        this.categoriaService.excluir(cat.id).subscribe({
          next: () => {
            this.notificationService.sucesso('Excluída', 'Categoria removida com sucesso.');
            this.carregarCategorias();
          },
          error: (err) => {
            // Caso tente excluir uma categoria que já tem produtos cadastrados
            this.notificationService.erro(
              'Ação Negada',
              'Não é possível excluir uma categoria que possui produtos.',
            );
          },
        });
      },
    });
  }

  // O 'computed' vigia automaticamente os sinais acima. Mudou um, ele refaz a lista!
  produtosFiltrados = computed(() => {
    const lista = this.produtos();
    const termo = this.termoPesquisa().toLowerCase().trim();
    const catId = this.categoriaSelecionada();

    if (!lista || lista.length === 0) return [];

    let filtrados = lista;

    // 1. Filtra de forma blindada pelo Nome da Categoria
    if (catId !== null && catId !== undefined && String(catId) !== 'null') {
      // Encontra qual é o nome da categoria que está selecionada no filtro
      const categoriaEncontrada = this.categorias().find((c) => Number(c.id) === Number(catId));
      const nomeCatSelecionada = categoriaEncontrada ? categoriaEncontrada.nome : null;

      if (nomeCatSelecionada) {
        filtrados = filtrados.filter((p) => {
          // O backend pode mandar o objeto completo ou apenas a string do nome
          const nomeCategoriaProduto = p.categoria?.nome || p.categoria;
          return nomeCategoriaProduto === nomeCatSelecionada;
        });
      }
    }

    // 2. Filtra APENAS pelo Nome do Produto
    if (termo !== '') {
      filtrados = filtrados.filter((p) => p.nome.toLowerCase().includes(termo));
    }

    return filtrados;
  });

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

  abrirModalEdicao(produto: any): void {
    this.modoEdicao.set(true);
    this.produtoIdEditando = produto.id;

    // A LINHA QUE FALTAVA ESTÁ AQUI ABAIXO 👇
    // Ela garante que o ID da categoria seja extraído como um Número puro
    const idDaCategoria = produto.categoria?.id
      ? Number(produto.categoria.id)
      : produto.categoriaId
        ? Number(produto.categoriaId)
        : null;

    this.produtoForm.set({
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
      categoriaId: idDaCategoria, // Agora o Angular vai encontrar a variável!
      tempoPreparoMinutos: produto.tempoPreparoMinutos,
      disponivel: produto.disponivel,
      quantidadeDisponivel: produto.quantidadeDisponivel,
      versao: produto.versao,
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
