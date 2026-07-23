import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PainelCozinhaComponent } from './painel-cozinha.component';
import { CozinhaService } from '../../../core/services/cozinha.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { FilaCozinhaResponse } from '../../../core/models';

describe('PainelCozinhaComponent', () => {
  let component: PainelCozinhaComponent;
  let fixture: ComponentFixture<PainelCozinhaComponent>;
  let cozinhaServiceMock: any;
  let pedidoServiceMock: any;
  let notificationServiceMock: any;
  let routerMock: any;

  const filaMock: FilaCozinhaResponse = {
    totalPedidos: 2,
    pedidos: [
      {
        id: 1, numero: 25, nomeCliente: 'João',
        dataHoraPedido: '2026-07-22T14:30:00',
        tempoEsperaMinutos: 5, status: 'RECEBIDO',
        itens: [
          { nomeProduto: 'X-Burger', quantidade: 2, status: 'PENDENTE' },
          { nomeProduto: 'Coca-Cola', quantidade: 1, status: 'PENDENTE' },
        ],
      },
      {
        id: 2, numero: 26, nomeCliente: 'Maria',
        dataHoraPedido: '2026-07-22T14:35:00',
        tempoEsperaMinutos: 0, status: 'PREPARANDO',
        itens: [
          { nomeProduto: 'Hot Dog', quantidade: 1, status: 'PREPARANDO' },
        ],
      },
    ],
  };

  beforeEach(async () => {
    cozinhaServiceMock = {
      listarFila: vi.fn().mockReturnValue(of(filaMock)),
      iniciarPreparo: vi.fn().mockReturnValue(of({})),
      marcarPronto: vi.fn().mockReturnValue(of({})),
      entregarPedido: vi.fn().mockReturnValue(of({})),
    };
    pedidoServiceMock = {
      cancelar: vi.fn().mockReturnValue(of({})),
    };
    notificationServiceMock = {
      tocarAlerta: vi.fn(),
      vibrar: vi.fn(),
    };
    routerMock = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [PainelCozinhaComponent],
      providers: [
        { provide: CozinhaService, useValue: cozinhaServiceMock },
        { provide: PedidoService, useValue: pedidoServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PainelCozinhaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar fila no init', () => {
    expect(cozinhaServiceMock.listarFila).toHaveBeenCalled();
    expect(component.filaResponse()?.totalPedidos).toBe(2);
  });

  it('deve filtrar pedidos', () => {
    component.filtroAtivo.set('HAMBURGUER');
    const filtrados = component.pedidosFiltrados;
    expect(filtrados.length).toBe(1);
    expect(filtrados[0].numero).toBe(25);
  });

  it('deve mostrar todos quando filtro TODOS', () => {
    component.filtroAtivo.set('TODOS');
    expect(component.pedidosFiltrados.length).toBe(2);
  });

  it('deve iniciar preparo', () => {
    component.iniciarPreparo(1);
    expect(cozinhaServiceMock.iniciarPreparo).toHaveBeenCalledWith(1);
  });

  it('deve marcar como pronto', () => {
    component.marcarPronto(2);
    expect(cozinhaServiceMock.marcarPronto).toHaveBeenCalledWith(2);
  });

  it('deve navegar para fechamento', () => {
    component.irParaFechamento();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/caixa/fechamento']);
  });

  it('deve navegar para pagamento', () => {
    component.verPagamento(25);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/caixa/pagamento', 25]);
  });
});
