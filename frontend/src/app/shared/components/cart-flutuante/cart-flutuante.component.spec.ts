import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartFlutuanteComponent } from './cart-flutuante.component';
import { ProdutoResponse, CategoriaProduto } from '../../../core/models';

describe('CartFlutuanteComponent', () => {
  let component: CartFlutuanteComponent;
  let fixture: ComponentFixture<CartFlutuanteComponent>;

  const produtoMock: ProdutoResponse = {
    id: 1,
    nome: 'X-Burger',
    descricao: 'Pão, carne, queijo',
    preco: 15.0,
    categoria: 'HAMBURGUER' as CategoriaProduto,
    tempoPreparoMinutos: 10,
    disponivel: true,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartFlutuanteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CartFlutuanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('não deve renderizar quando não houver itens', () => {
    component.itens = [];
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const fixed = el.querySelector('.fixed');
    expect(fixed).toBeNull();
  });

  it('deve renderizar quando houver itens', () => {
    component.itens = [{ produto: produtoMock, quantidade: 2 }];
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const fixed = el.querySelector('.fixed');
    expect(fixed).not.toBeNull();
  });

  it('deve calcular o total corretamente', () => {
    component.itens = [
      { produto: produtoMock, quantidade: 2 },
      { produto: { ...produtoMock, id: 2, preco: 10 }, quantidade: 1 },
    ];
    expect(component.total).toBe(40);
  });

  it('deve calcular totalItens corretamente', () => {
    component.itens = [
      { produto: produtoMock, quantidade: 2 },
      { produto: { ...produtoMock, id: 2 }, quantidade: 3 },
    ];
    expect(component.totalItens).toBe(5);
  });

  it('deve emitir onConfirm ao clicar no botão', () => {
    const emitSpy = vi.spyOn(component.onConfirm, 'emit');
    component.itens = [{ produto: produtoMock, quantidade: 1 }];
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('.btn-primary') as HTMLButtonElement;
    btn.click();
    expect(emitSpy).toHaveBeenCalled();
  });

  it('deve emitir onClear ao clicar em Limpar', () => {
    const emitSpy = vi.spyOn(component.onClear, 'emit');
    component.itens = [{ produto: produtoMock, quantidade: 1 }];
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    btn.click();
    expect(emitSpy).toHaveBeenCalled();
  });

  it('deve desabilitar o botão quando disabled for true', () => {
    component.itens = [{ produto: produtoMock, quantidade: 1 }];
    component.disabled = true;
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('.btn-primary') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('deve exibir o texto do botão personalizado', () => {
    component.itens = [{ produto: produtoMock, quantidade: 1 }];
    component.buttonText = 'Finalizar';
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('.btn-primary') as HTMLButtonElement;
    expect(btn.textContent?.trim()).toContain('Finalizar');
  });
});
