import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PagamentoComponent } from './pagamento.component';
import { PedidoService } from '../../../core/services/pedido.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PedidoResponse } from '../../../core/models';

describe('PagamentoComponent', () => {
  let component: PagamentoComponent;
  let fixture: ComponentFixture<PagamentoComponent>;
  let pedidoServiceMock: any;
  let routerMock: any;

  const pedidoMock: PedidoResponse = {
    id: 1,
    numero: 25,
    nomeCliente: 'João',
    tipo: 'LEVAR',
    origem: 'QR_CODE',
    status: 'PRONTO',
    statusPagamento: 'AGUARDANDO',
    valorTotal: 37.0,
    dataHoraPedido: '2026-07-22T14:30:00',
    itens: [
      {
        id: 1,
        produtoId: 1,
        nomeProduto: 'X-Burger',
        descricaoProduto: '',
        quantidade: 2,
        precoUnitario: 15.0,
        subtotal: 30.0,
        status: 'PRONTO',
      },
      {
        id: 2,
        produtoId: 2,
        nomeProduto: 'Coca-Cola',
        descricaoProduto: '',
        quantidade: 1,
        precoUnitario: 7.0,
        subtotal: 7.0,
        status: 'PRONTO',
      },
    ],
  };

  beforeEach(async () => {
    pedidoServiceMock = {
      buscarPorId: vi.fn().mockReturnValue(of(pedidoMock)),
      registrarPagamento: vi.fn().mockReturnValue(
        of({ ...pedidoMock, statusPagamento: 'PAGO', metodoPagamento: 'DINHEIRO' })
      ),
    };

    routerMock = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [PagamentoComponent],
      providers: [
        { provide: PedidoService, useValue: pedidoServiceMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PagamentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar pedido no init', () => {
    expect(pedidoServiceMock.buscarPorId).toHaveBeenCalledWith(1);
    expect(component.pedido()?.numero).toBe(25);
  });

  it('deve selecionar método de pagamento', () => {
    component.selecionarMetodo('PIX');
    expect(component.metodoSelecionado()).toBe('PIX');
  });

  it('deve calcular troco corretamente', () => {
    component.pedido.set(pedidoMock);
    component.valorRecebido.set(50);
    expect(component.troco).toBe(13);
  });

  it('não deve permitir confirmar sem método', () => {
    component.pedido.set(pedidoMock);
    expect(component.podeConfirmar).toBe(false);
  });

  it('deve permitir confirmar com método selecionado', () => {
    component.pedido.set(pedidoMock);
    component.selecionarMetodo('PIX');
    expect(component.podeConfirmar).toBe(true);
  });

  it('deve exigir valor suficiente para dinheiro', () => {
    component.pedido.set(pedidoMock);
    component.selecionarMetodo('DINHEIRO');
    component.valorRecebido.set(10);
    expect(component.podeConfirmar).toBe(false);

    component.valorRecebido.set(40);
    expect(component.podeConfirmar).toBe(true);
  });

  it('deve confirmar pagamento', () => {
    component.pedido.set(pedidoMock);
    component.selecionarMetodo('DINHEIRO');
    component.valorRecebido.set(40);
    component.confirmarPagamento();

    expect(pedidoServiceMock.registrarPagamento).toHaveBeenCalled();
    expect(component.sucesso()).toBe(true);
  });

  it('deve navegar para novo pedido', () => {
    component.novoPedido();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/cliente/cardapio']);
  });
});
