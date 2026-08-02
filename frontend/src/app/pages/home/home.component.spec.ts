import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { CaixaService } from '../../core/services/caixa.service';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let caixaServiceMock: any;
  let authServiceMock: any;
  let routerMock: any;

  const statusAberto = {
    status: 'ABERTO' as const,
    mensagem: '🟢 Atendendo normalmente!',
    mensagemDetalhada: 'Faça seu pedido.',
    icone: '🟢',
    podePedir: true,
  };

  const statusFechado = {
    status: 'FECHADO' as const,
    mensagem: '🔒 Fechado',
    mensagemDetalhada: 'Volte amanhã!',
    icone: '🔒',
    podePedir: false,
  };

  const statusPausado = {
    status: 'PAUSADO' as const,
    mensagem: '⏸️ Pausa',
    mensagemDetalhada: 'Voltamos em 30 minutos!',
    icone: '🍽️',
    podePedir: false,
    tempoEstimado: '30 minutos',
  };

  beforeEach(async () => {
    caixaServiceMock = {
      getStatus: vi.fn().mockReturnValue(of(statusAberto)),
    };

    authServiceMock = {
      isCliente: vi.fn().mockReturnValue(false),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        { provide: CaixaService, useValue: caixaServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar status do caixa no init', () => {
    expect(caixaServiceMock.getStatus).toHaveBeenCalled();
    expect(component.statusCaixa()?.status).toBe('ABERTO');
  });

  it('deve mostrar botão "Ver Cardápio" quando caixa aberto', () => {
    const el: HTMLElement = fixture.nativeElement;
    const btn = el.querySelector('.btn-primary');
    expect(btn?.textContent?.trim()).toContain('Ver Cardápio');
  });

  it('deve mostrar mensagem de pausa quando caixa pausado', () => {
    caixaServiceMock.getStatus.mockReturnValue(of(statusPausado));
    component.verificarStatus();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Dando um tempinho');
    expect(el.textContent).toContain('30 minutos');
  });

  it('deve mostrar mensagem de fechado quando caixa fechado', () => {
    caixaServiceMock.getStatus.mockReturnValue(of(statusFechado));
    component.verificarStatus();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Fechado no momento');
  });

  it('deve redirecionar para login se não for cliente', () => {
    component.irParaCardapio();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/cliente/login']);
  });

  it('deve redirecionar para cardápio se for cliente', () => {
    authServiceMock.isCliente.mockReturnValue(true);
    component.isCliente.set(true);
    component.irParaCardapio();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/cliente/cardapio']);
  });

  it('deve navegar para login do dono', () => {
    component.irParaLoginDono();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dono/login']);
  });

  it('deve exibir o nome do estabelecimento', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Bora Rochedo');
  });
});
