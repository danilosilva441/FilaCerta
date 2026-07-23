import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';
import { Component } from '@angular/core';

// Componente host para testar ng-content
@Component({
  standalone: true,
  imports: [EmptyStateComponent],
  template: `
    <app-empty-state [icon]="'restaurant'" [title]="'Vazio'" [description]="'Nada aqui'">
      <button>Recarregar</button>
    </app-empty-state>
  `,
})
class TestHostComponent {}

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve exibir o ícone padrão', () => {
    const el: HTMLElement = fixture.nativeElement;
    const icon = el.querySelector('.material-icons');
    expect(icon?.textContent?.trim()).toBe('inbox');
  });

  it('deve exibir o ícone personalizado', () => {
    component.icon = 'restaurant';
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const icon = el.querySelector('.material-icons');
    expect(icon?.textContent?.trim()).toBe('restaurant');
  });

  it('deve exibir o título padrão', () => {
    const el: HTMLElement = fixture.nativeElement;
    const title = el.querySelector('h3');
    expect(title?.textContent?.trim()).toBe('Nada por aqui');
  });

  it('deve exibir o título personalizado', () => {
    component.title = 'Sem pedidos';
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const title = el.querySelector('h3');
    expect(title?.textContent?.trim()).toBe('Sem pedidos');
  });

  it('não deve exibir descrição quando não fornecida', () => {
    component.description = undefined;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const desc = el.querySelector('p');
    expect(desc).toBeNull();
  });

  it('deve exibir descrição quando fornecida', () => {
    component.description = 'Tente novamente mais tarde';
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const desc = el.querySelector('p');
    expect(desc?.textContent?.trim()).toBe('Tente novamente mais tarde');
  });

  it('deve renderizar conteúdo projetado (ng-content)', async () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
    const el: HTMLElement = hostFixture.nativeElement;
    const button = el.querySelector('button');
    expect(button).not.toBeNull();
    expect(button?.textContent?.trim()).toBe('Recarregar');
  });
});
