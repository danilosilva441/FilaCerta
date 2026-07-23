import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardapioComponent } from './cardapio.component';
import { ProdutoService } from '../../../core/services/produto.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProdutoResponse, CategoriaProduto } from '../../../core/models';

describe('CardapioComponent', () => {
  let component: CardapioComponent;
  let fixture: ComponentFixture<CardapioComponent>;
  let produtoServiceMock: any;
  let pedidoServiceMock: any;
  let routerMock: any;

  const produtosMock: ProdutoResponse[] = [
    {
      id: 1,
      nome: 'X-Burger',
      descricao: 'Pão, carne, queijo',
      preco: 15.0,
      categoria: 'HAMBURGUER' as CategoriaProduto,
      tempoPreparoMinutos: 10,
      disponivel: true,
    },
    {
      id: 2,
      nome: 'Coca-Cola',
      descricao: 'Lata 350ml',
      preco: 7.0,
      categoria: 'BEBIDA' as CategoriaProduto,
      tempoPreparoMinutos: 0,
      disponivel: true,
    },
    {
      id: 3,
      nome: 'Hot Dog',
      descricao: 'Salsicha, molho, batata',
      preco: 12.0,
      categoria: 'CACHORRO_QUENTE' as CategoriaProduto,
      tempoPreparoMinutos: 4,
      disponivel: true,
    },
  ];

  beforeEach(async () => {
    produtoServiceMock = {
      listarDisponiveis: vi.fn().mockReturnValue(of(produtosMock)),
    };

    pedidoServiceMock = {
      criar: vi.fn().mockReturnValue(of({ id: 1, numero: 1 })),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [CardapioComponent],
      providers: [
        { provide: ProdutoService, useValue: produtoServiceMock },
        { provide: PedidoService, useValue: pedidoServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CardapioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar produtos no init', () => {
    expect(produtoServiceMock.listarDisponiveis).toHaveBeenCalled();
    expect(component.produtos().length).toBe(3);
  });

  it('deve filtrar produtos por categoria', () => {
    component.categoriaSelecionada.set('BEBIDA');
    expect(component.produtosFiltrados.length).toBe(1);
    expect(component.produtosFiltrados[0].nome).toBe('Coca-Cola');
  });

  it('deve mostrar todos os produtos quando categoria é TODOS', () => {
    component.categoriaSelecionada.set('TODOS');
    expect(component.produtosFiltrados.length).toBe(3);
  });

  it('deve adicionar item ao carrinho', () => {
    component.adicionar(produtosMock[0]);
    expect(component.getQuantidade(1)).toBe(1);

    component.adicionar(produtosMock[0]);
    expect(component.getQuantidade(1)).toBe(2);
  });

  it('deve remover item do carrinho', () => {
    component.adicionar(produtosMock[0]);
    component.adicionar(produtosMock[0]);
    component.remover(produtosMock[0]);
    expect(component.getQuantidade(1)).toBe(1);

    component.remover(produtosMock[0]);
    expect(component.getQuantidade(1)).toBe(0);
  });

  it('deve limpar o carrinho', () => {
    component.adicionar(produtosMock[0]);
    component.adicionar(produtosMock[1]);
    component.limparCarrinho();
    expect(component.carrinho().size).toBe(0);
  });

  it('deve retornar itens do carrinho', () => {
    component.adicionar(produtosMock[0]);
    component.adicionar(produtosMock[0]);
    component.adicionar(produtosMock[1]);

    const itens = component.carrinhoItens;
    expect(itens.length).toBe(2);
    expect(itens[0].quantidade).toBe(2);
    expect(itens[1].quantidade).toBe(1);
  });

  it('não deve permitir envio sem nome e itens', () => {
    expect(component.podeEnviar).toBe(false);

    component.nomeCliente.set('Jo');
    expect(component.podeEnviar).toBe(false);

    component.adicionar(produtosMock[0]);
    expect(component.podeEnviar).toBe(true);
  });

  it('deve enviar pedido e navegar para acompanhamento', () => {
    component.nomeCliente.set('João');
    component.tipoPedido.set('LEVAR');
    component.adicionar(produtosMock[0]);

    component.enviarPedido();

    expect(pedidoServiceMock.criar).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/cliente/acompanhamento', 1]);
  });

  it('deve lidar com erro ao carregar produtos', () => {
    produtoServiceMock.listarDisponiveis.mockReturnValue(
      throwError(() => new Error('Erro'))
    );
    component.carregarProdutos();
    expect(component.error()).toBe(true);
  });

  it('deve lidar com erro ao enviar pedido', () => {
    pedidoServiceMock.criar.mockReturnValue(
      throwError(() => new Error('Erro'))
    );
    component.nomeCliente.set('João');
    component.adicionar(produtosMock[0]);

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    component.enviarPedido();

    expect(component.enviando()).toBe(false);
    expect(alertSpy).toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});
