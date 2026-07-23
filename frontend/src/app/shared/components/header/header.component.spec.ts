import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { provideRouter } from '@angular/router';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve exibir o título padrão', () => {
    const el: HTMLElement = fixture.nativeElement;
    const title = el.querySelector('h1');
    expect(title?.textContent?.trim()).toBe('Fila Certa');
  });

  it('deve exibir o título personalizado', () => {
    component.title = 'Cardápio';
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const title = el.querySelector('h1');
    expect(title?.textContent?.trim()).toBe('Cardápio');
  });

  it('não deve exibir subtítulo quando não fornecido', () => {
    component.subtitle = undefined;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const subtitle = el.querySelector('p');
    expect(subtitle).toBeNull();
  });

  it('deve exibir subtítulo quando fornecido', () => {
    component.subtitle = 'Faça seu pedido';
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const subtitle = el.querySelector('p');
    expect(subtitle?.textContent?.trim()).toBe('Faça seu pedido');
  });

  it('não deve mostrar botão voltar por padrão', () => {
    const el: HTMLElement = fixture.nativeElement;
    const backBtn = el.querySelector('[aria-label="Voltar"]');
    expect(backBtn).toBeNull();
  });

  it('deve mostrar botão voltar quando showBack é true', () => {
    component.showBack = true;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const backBtn = el.querySelector('[aria-label="Voltar"]');
    expect(backBtn).not.toBeNull();
  });

  it('deve chamar history.back quando goBack é executado', () => {
    const backSpy = vi.spyOn(window.history, 'back');
    component.goBack();
    expect(backSpy).toHaveBeenCalled();
  });

  it('deve exibir botão de ação direita quando configurado', () => {
    component.rightAction = {
      icon: 'settings',
      label: 'Configurações',
      handler: () => {},
    };
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const icon = el.querySelector('.material-icons');
    expect(icon?.textContent?.trim()).toBe('settings');
  });

  it('deve executar handler ao clicar na ação direita', () => {
    const handlerSpy = vi.fn();
    component.rightAction = {
      icon: 'refresh',
      label: 'Atualizar',
      handler: handlerSpy,
    };
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const buttons = el.querySelectorAll('button');
    const actionBtn = buttons[buttons.length - 1] as HTMLButtonElement;
    actionBtn.click();
    expect(handlerSpy).toHaveBeenCalled();
  });
});
