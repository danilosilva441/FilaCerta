import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReativarCaixaComponent } from './reativar-caixa.component';
import { CaixaService } from '../../../core/services/caixa.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('ReativarCaixaComponent', () => {
  let component: ReativarCaixaComponent;
  let fixture: ComponentFixture<ReativarCaixaComponent>;
  let caixaServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    caixaServiceMock = {
      buscarCaixaHoje: vi.fn().mockReturnValue(of({
        motivoPausa: 'Almoço',
        tempoEstimadoRetorno: '30 minutos',
        horaPausa: '14:07:20',
        status: 'PAUSADO',
      })),
      reativar: vi.fn().mockReturnValue(of({ success: true })),
    };

    routerMock = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ReativarCaixaComponent],
      providers: [
        { provide: CaixaService, useValue: caixaServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReativarCaixaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar dados da pausa no init', () => {
    expect(caixaServiceMock.buscarCaixaHoje).toHaveBeenCalled();
    expect(component.motivoPausa()).toBe('Almoço');
  });

  it('deve reativar com sucesso', () => {
    vi.useFakeTimers();
    component.reativar();
    expect(caixaServiceMock.reativar).toHaveBeenCalled();
    expect(component.sucesso()).toBe(true);
    vi.advanceTimersByTime(1500);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/cozinha/painel']);
    vi.useRealTimers();
  });

  it('deve tratar erro ao reativar', () => {
    caixaServiceMock.reativar.mockReturnValue(throwError(() => new Error('Erro')));
    component.reativar();
    expect(component.erro()).toBe(true);
  });

  it('deve voltar ao histórico', () => {
    const backSpy = vi.spyOn(window.history, 'back');
    component.voltar();
    expect(backSpy).toHaveBeenCalled();
  });
});
