import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CaixaPausadoComponent } from './caixa-pausado.component';
import { CaixaService } from '../../../core/services/caixa.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('CaixaPausadoComponent', () => {
  let component: CaixaPausadoComponent;
  let fixture: ComponentFixture<CaixaPausadoComponent>;
  let caixaServiceMock: any;
  let routerMock: any;

  const statusPausado = {
    status: 'PAUSADO' as const,
    mensagem: '⏸️ Pausa para almoço',
    mensagemDetalhada: 'Voltamos em 30 minutos!',
    icone: '🍽️',
    podePedir: false,
    horaPausa: '14:07:20',
    motivoPausa: 'Almoço',
    tempoEstimado: '30 minutos',
  };

  const statusAberto = {
    status: 'ABERTO' as const,
    mensagem: '🟢 Atendendo normalmente!',
    mensagemDetalhada: 'Faça seu pedido.',
    icone: '🟢',
    podePedir: true,
  };

  beforeEach(async () => {
    caixaServiceMock = {
      getStatus: vi.fn().mockReturnValue(of(statusPausado)),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [CaixaPausadoComponent],
      providers: [
        { provide: CaixaService, useValue: caixaServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CaixaPausadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar status no init', () => {
    expect(caixaServiceMock.getStatus).toHaveBeenCalled();
    expect(component.status()?.status).toBe('PAUSADO');
  });

  it('deve redirecionar se caixa reabrir', () => {
    caixaServiceMock.getStatus.mockReturnValue(of(statusAberto));
    component.verificarStatus();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/cardapio']);
  });

  it('deve navegar para login do dono', () => {
    component.irParaLoginDono();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login/dono']);
  });

  it('deve exibir mensagem de pausa', () => {
    const el: HTMLElement = fixture.nativeElement;
    const h1 = el.querySelector('h1');
    expect(h1?.textContent?.trim()).toContain('Pausa para almoço');
  });

  it('deve exibir tempo estimado', () => {
    const el: HTMLElement = fixture.nativeElement;
    const tempo = el.querySelector('.text-2xl');
    expect(tempo?.textContent?.trim()).toBe('30 minutos');
  });

  it('deve exibir motivo da pausa', () => {
    const el: HTMLElement = fixture.nativeElement;
    const motivo = el.querySelector('.font-medium');
    expect(motivo?.textContent?.trim()).toBe('Almoço');
  });
});
