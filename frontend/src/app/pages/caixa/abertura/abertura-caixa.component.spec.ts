import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AberturaCaixaComponent } from './abertura-caixa.component';
import { CaixaService } from '../../../core/services/caixa.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('AberturaCaixaComponent', () => {
  let component: AberturaCaixaComponent;
  let fixture: ComponentFixture<AberturaCaixaComponent>;
  let caixaServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    caixaServiceMock = {
      abrir: vi.fn().mockReturnValue(of(void 0)),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AberturaCaixaComponent],
      providers: [
        { provide: CaixaService, useValue: caixaServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AberturaCaixaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve ter valor inicial padrão 50', () => {
    expect(component.valorInicial()).toBe(50);
  });

  it('deve selecionar valor rápido', () => {
    component.selecionarValor(100);
    expect(component.valorInicial()).toBe(100);
  });

  it('deve mostrar erro para valor negativo', () => {
    component.valorInicial.set(-10);
    component.abrirCaixa();
    expect(component.erro()).toBe(true);
    expect(component.mensagemErro()).toContain('negativo');
  });

  it('deve abrir caixa com sucesso', () => {
    vi.useFakeTimers();
    component.valorInicial.set(50);
    component.abrirCaixa();

    expect(caixaServiceMock.abrir).toHaveBeenCalled();
    expect(component.sucesso()).toBe(true);

    vi.advanceTimersByTime(1500);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/cozinha/painel']);
    vi.useRealTimers();
  });

  it('deve tratar erro ao abrir caixa', () => {
    caixaServiceMock.abrir.mockReturnValue(
      throwError(() => new Error('Erro de conexão'))
    );
    component.abrirCaixa();

    expect(component.erro()).toBe(true);
    expect(component.mensagemErro()).toContain('Erro de conexão');
  });

  it('deve navegar para trás ao clicar voltar', () => {
    const backSpy = vi.spyOn(window.history, 'back');
    component.voltar();
    expect(backSpy).toHaveBeenCalled();
  });

  it('deve ter valores rápidos disponíveis', () => {
    expect(component.valoresRapidos.length).toBeGreaterThan(0);
    expect(component.valoresRapidos).toContain(50);
    expect(component.valoresRapidos).toContain(0);
  });
});
