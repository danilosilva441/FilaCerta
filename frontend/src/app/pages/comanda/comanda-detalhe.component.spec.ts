import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComandaDetalheComponent } from './comanda-detalhe.component';
import { ComandaService } from '../../core/services/comanda.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ComandaResponse } from '../../core/models';

describe('ComandaDetalheComponent', () => {
  let component: ComandaDetalheComponent;
  let fixture: ComponentFixture<ComandaDetalheComponent>;
  let comandaServiceMock: any;
  let routerMock: any;

  const comandaMock: ComandaResponse = {
    id: 1,
    codigo: 'M05',
    nomeCliente: 'João',
    mesa: 3,
    status: 'ABERTA',
    valorTotal: 85.0,
    abertura: '2026-07-22T14:30:00',
    pedidos: [
      {
        id: 1, numero: 25, nomeCliente: 'João',
        tipo: 'COMER_AQUI', origem: 'QR_CODE',
        status: 'ENTREGUE', statusPagamento: 'AGUARDANDO',
        valorTotal: 37.0, dataHoraPedido: '2026-07-22T14:30:00',
        itens: [],
      },
      {
        id: 2, numero: 28, nomeCliente: 'João',
        tipo: 'COMER_AQUI', origem: 'QR_CODE',
        status: 'PREPARANDO', statusPagamento: 'AGUARDANDO',
        valorTotal: 48.0, dataHoraPedido: '2026-07-22T14:45:00',
        itens: [],
      },
    ],
  };

  beforeEach(async () => {
    comandaServiceMock = {
      buscarDetalhe: vi.fn().mockReturnValue(of(comandaMock)),
      fechar: vi.fn().mockReturnValue(of({ ...comandaMock, status: 'FECHADA' })),
    };

    routerMock = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ComandaDetalheComponent],
      providers: [
        { provide: ComandaService, useValue: comandaServiceMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ComandaDetalheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar comanda no init', () => {
    expect(comandaServiceMock.buscarDetalhe).toHaveBeenCalledWith(1);
    expect(component.comanda()?.codigo).toBe('M05');
  });

  it('deve calcular total da comanda (excluindo cancelados)', () => {
    component.comanda.set(comandaMock);
    expect(component.totalComanda).toBe(85.0);
  });

  it('deve separar pedidos ativos', () => {
    component.comanda.set(comandaMock);
    expect(component.pedidosAtivos.length).toBe(1);
    expect(component.pedidosAtivos[0].numero).toBe(28);
  });

  it('deve separar pedidos finalizados', () => {
    component.comanda.set(comandaMock);
    expect(component.pedidosFinalizados.length).toBe(1);
    expect(component.pedidosFinalizados[0].numero).toBe(25);
  });

  it('deve confirmar fechamento', () => {
    component.comanda.set(comandaMock);
    component.confirmarFechamento();

    expect(comandaServiceMock.fechar).toHaveBeenCalledWith(1);
    expect(component.sucesso()).toBe(true);
  });

  it('deve navegar para detalhe do pedido', () => {
    component.verPedido(25);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/cliente/pedido', 25]);
  });

  it('deve navegar para cardápio ao adicionar pedido', () => {
    component.novoPedido();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/cliente/cardapio']);
  });
});
