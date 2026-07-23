import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingSpinnerComponent } from './loading-spinner.component';

describe('LoadingSpinnerComponent', () => {
  let component: LoadingSpinnerComponent;
  let fixture: ComponentFixture<LoadingSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSpinnerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve ter tamanho padrão md', () => {
    expect(component.size).toBe('md');
  });

  it('deve renderizar o spinner', () => {
    const el: HTMLElement = fixture.nativeElement;
    const spinner = el.querySelector('[role="status"]');
    expect(spinner).not.toBeNull();
  });

  it('deve ter texto para leitor de tela', () => {
    const el: HTMLElement = fixture.nativeElement;
    const srOnly = el.querySelector('.sr-only');
    expect(srOnly?.textContent?.trim()).toBe('Carregando...');
  });

  it('não deve exibir mensagem quando não fornecida', () => {
    component.message = undefined;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const message = el.querySelector('p');
    expect(message).toBeNull();
  });

  it('deve exibir mensagem quando fornecida', () => {
    component.message = 'Buscando dados...';
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const message = el.querySelector('p');
    expect(message?.textContent?.trim()).toBe('Buscando dados...');
  });

  it('deve aplicar tamanho sm corretamente', () => {
    component.size = 'sm';
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const spinner = el.querySelector('.animate-spin');
    expect(spinner?.classList.contains('w-8')).toBe(true);
    expect(spinner?.classList.contains('h-8')).toBe(true);
  });

  it('deve aplicar tamanho lg corretamente', () => {
    component.size = 'lg';
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const spinner = el.querySelector('.animate-spin');
    expect(spinner?.classList.contains('w-14')).toBe(true);
    expect(spinner?.classList.contains('h-14')).toBe(true);
  });

  it('deve ter aria-live polite para acessibilidade', () => {
    const el: HTMLElement = fixture.nativeElement;
    const status = el.querySelector('[aria-live="polite"]');
    expect(status).not.toBeNull();
  });
});
