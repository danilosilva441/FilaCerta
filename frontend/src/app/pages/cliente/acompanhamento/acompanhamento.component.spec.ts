import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AcompanhamentoComponent } from './acompanhamento.component';
import { PedidoService } from '../../../core/services/pedido.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PedidoResponse } from '../../../core/models';

describe('AcompanhamentoComponent', () => {
  let component: AcompanhamentoComponent;
  let fixture: ComponentFixture<AcompanhamentoComponent>;
  let pedidoServiceMock: any;
  let notificationServiceMock: any;

  const pedidoRecebido: PedidoResponse = {
    id: 1, numero: 25, nomeCliente: 'João',
    tipo: 'LEVAR', origem: 'QR_CODE',
    status: 'RECEBIDO', statusPagamento: 'AGUARDANDO',
    valorTotal: 37.0, dataHoraPedido: '2026-07-22T14:30:00',
    itens: [],
  };

  const pedidoPronto: PedidoResponse = {
    ...pedidoRecebido,
    status: 'PRONTO',
    dataHoraPronto: '2026-07-22T14:40:00',
  };

  beforeEach(async () => {
    pedidoServiceMock = {
      buscarPorId: vi.fn().mockReturnValue(of(pedidoRecebido)),
    };

    notificationServiceMock = {
      tocarAlerta: vi.fn(),
      vibrar: vi.fn(),
      notificarSistema: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AcompanhamentoComponent],
      providers: [
        { provide: PedidoService, useValue: pedidoServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AcompanhamentoComponent);
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

  it('deve notificar quando pedido ficar pronto', () => {
    pedidoServiceMock.buscarPorId.mockReturnValue(of(pedidoPronto));
    component.iniciarPolling(1);

    expect(notificationServiceMock.tocarAlerta).toHaveBeenCalled();
    expect(notificationServiceMock.vibrar).toHaveBeenCalled();
  });

  it('deve detectar pedido finalizado', () => {
    expect(component.isFinalizado('PRONTO')).toBe(true);
    expect(component.isFinalizado('ENTREGUE')).toBe(true);
    expect(component.isFinalizado('CANCELADO')).toBe(true);
    expect(component.isFinalizado('RECEBIDO')).toBe(false);
    expect(component.isFinalizado('PREPARANDO')).toBe(false);
  });

  it('deve retornar ícone correto por status', () => {
    component.pedido.set(pedidoRecebido);
    expect(component.statusIcon).toBe('📋');

    component.pedido.set(pedidoPronto);
    expect(component.statusIcon).toBe('✅');
  });

  it('deve retornar progresso por status', () => {
    component.pedido.set({ ...pedidoRecebido, status: 'RECEBIDO' });
    expect(component.progressoWidth).toBe(10);

    component.pedido.set({ ...pedidoRecebido, status: 'PREPARANDO' });
    expect(component.progressoWidth).toBe(50);

    component.pedido.set(pedidoPronto);
    expect(component.progressoWidth).toBe(100);
  });
});
