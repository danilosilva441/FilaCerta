import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FechamentoCaixaComponent } from './fechamento-caixa.component';
import { CaixaService } from '../../../core/services/caixa.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('FechamentoCaixaComponent', () => {
  let component: FechamentoCaixaComponent;
  let fixture: ComponentFixture<FechamentoCaixaComponent>;
  let caixaServiceMock: any;
  let routerMock: any;

  const caixaMock = {
    id: 1,
    data: '2026-07-22',
    horaAbertura: '14:00',
    status: 'ABERTO' as const,
    valorInicial: 50,
    totalDinheiro: 200,
    totalDebito: 150,
    totalCredito: 100,
    totalPix: 80,
    totalFiado: 20,
    totalPedidos: 25,
    totalCancelados: 2,
  };

  beforeEach(async () => {
    caixaServiceMock = {
      buscarCaixaHoje: vi.fn().mockReturnValue(of(caixaMock)),
      fechar: vi.fn().mockReturnValue(of(void 0)),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [FechamentoCaixaComponent],
      providers: [
        { provide: CaixaService, useValue: caixaServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FechamentoCaixaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar caixa no init', () => {
    expect(caixaServiceMock.buscarCaixaHoje).toHaveBeenCalled();
    expect(component.caixa()).not.toBeNull();
  });

  it('deve calcular total geral corretamente', () => {
    component.caixa.set(caixaMock);
    expect(component.totalGeral).toBe(550);
  });

  it('deve calcular ticket médio corretamente', () => {
    component.caixa.set(caixaMock);
    expect(component.ticketMedio).toBe(22);
  });

  it('deve detectar caixa fechado', () => {
    component.caixa.set({ ...caixaMock, status: 'FECHADO' });
    expect(component.caixaFechado).toBe(true);
  });

  it('deve confirmar fechamento', () => {
    component.caixa.set(caixaMock);
    component.confirmarFechamento();
    expect(caixaServiceMock.fechar).toHaveBeenCalled();
  });

  it('deve tratar erro ao carregar', () => {
    caixaServiceMock.buscarCaixaHoje.mockReturnValue(
      throwError(() => new Error('Erro'))
    );
    component.carregarCaixa();
    expect(component.error()).toBe(true);
  });

  it('deve navegar para cozinha ao ver pedidos', () => {
    component.verPedidos();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dono/cozinha/painel']);
  });

  it('deve navegar para dashboard', () => {
    component.irParaDashboard();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dono/dashboard']);
  });

  it('deve ter navItems com rotas corretas', () => {
    expect(component.navItems[0].route).toBe('/dono/dashboard');
    expect(component.navItems[1].route).toBe('/dono/cozinha/painel');
    expect(component.navItems[2].route).toBe('/dono/caixa/abertura');
    expect(component.navItems[3].route).toBe('/dono/caixa/fechamento');
  });
});
