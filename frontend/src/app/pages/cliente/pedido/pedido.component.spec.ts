import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PedidoComponent } from './pedido.component';
import { PedidoService } from '../../../core/services/pedido.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PedidoResponse } from '../../../core/models';

describe('PedidoComponent', () => {
  let component: PedidoComponent;
  let fixture: ComponentFixture<PedidoComponent>;
  let pedidoServiceMock: any;
  let routerMock: any;

  const pedidoMock: PedidoResponse = {
    id: 1,
    numero: 25,
    nomeCliente: 'João',
    tipo: 'LEVAR',
    origem: 'QR_CODE',
    status: 'RECEBIDO',
    statusPagamento: 'AGUARDANDO',
    valorTotal: 37.0,
    dataHoraPedido: '2026-07-22T14:30:00',
    itens: [
      {
        id: 1,
        produtoId: 1,
        nomeProduto: 'X-Burger',
        descricaoProduto: 'Pão, carne, queijo',
        quantidade: 2,
        precoUnitario: 15.0,
        subtotal: 30.0,
        status: 'PENDENTE',
      },
      {
        id: 2,
        produtoId: 2,
        nomeProduto: 'Coca-Cola',
        descricaoProduto: 'Lata 350ml',
        quantidade: 1,
        precoUnitario: 7.0,
        subtotal: 7.0,
        status: 'PENDENTE',
      },
    ],
  };

  beforeEach(async () => {
    pedidoServiceMock = {
      buscarPorId: vi.fn().mockReturnValue(of(pedidoMock)),
      cancelar: vi.fn().mockReturnValue(of({ ...pedidoMock, status: 'CANCELADO' })),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [PedidoComponent],
      providers: [
        { provide: PedidoService, useValue: pedidoServiceMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar pedido no init', () => {
    expect(pedidoServiceMock.buscarPorId).toHaveBeenCalledWith(1);
    expect(component.pedido()).not.toBeNull();
    expect(component.pedido()?.numero).toBe(25);
  });

  it('deve lidar com erro ao carregar', () => {
    pedidoServiceMock.buscarPorId.mockReturnValue(throwError(() => new Error('Erro')));
    component.carregarPedido(99);
    expect(component.error()).toBe(true);
  });

  it('deve permitir cancelar apenas RECEBIDO e PREPARANDO', () => {
    component.pedido.set({ ...pedidoMock, status: 'RECEBIDO' });
    expect(component.podeCancelar).toBe(true);

    component.pedido.set({ ...pedidoMock, status: 'PREPARANDO' });
    expect(component.podeCancelar).toBe(true);

    component.pedido.set({ ...pedidoMock, status: 'PRONTO' });
    expect(component.podeCancelar).toBe(false);
  });

  it('deve permitir editar apenas RECEBIDO', () => {
    component.pedido.set({ ...pedidoMock, status: 'RECEBIDO' });
    expect(component.podeEditar).toBe(true);

    component.pedido.set({ ...pedidoMock, status: 'PREPARANDO' });
    expect(component.podeEditar).toBe(false);
  });

  it('deve confirmar cancelamento', () => {
    component.pedido.set(pedidoMock);
    component.confirmarCancelamento();

    expect(pedidoServiceMock.cancelar).toHaveBeenCalledWith(1);
    expect(component.pedido()?.status).toBe('CANCELADO');
    expect(component.showCancelDialog()).toBe(false);
  });

  it('deve navegar para novo pedido', () => {
    component.novoPedido();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/cliente/cardapio']);
  });

  it('deve retornar ícone correto por status', () => {
    component.pedido.set({ ...pedidoMock, status: 'PRONTO' });
    expect(component.statusIcon).toBe('✅');

    component.pedido.set({ ...pedidoMock, status: 'CANCELADO' });
    expect(component.statusIcon).toBe('❌');
  });
});
