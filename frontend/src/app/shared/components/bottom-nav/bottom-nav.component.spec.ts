import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BottomNavComponent, NavItem } from './bottom-nav.component';
import { provideRouter } from '@angular/router';

describe('BottomNavComponent', () => {
  let component: BottomNavComponent;
  let fixture: ComponentFixture<BottomNavComponent>;

  const items: NavItem[] = [
    { label: 'Cardápio', icon: 'restaurant_menu', route: '/cardapio' },
    { label: 'Pedidos', icon: 'receipt_long', route: '/pedidos', badge: 3 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomNavComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BottomNavComponent);
    component = fixture.componentInstance;
    component.items = items;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => expect(component).toBeTruthy());
  it('deve renderizar itens de navegação', () => {
    const el: HTMLElement = fixture.nativeElement;
    const links = el.querySelectorAll('a');
    expect(links.length).toBe(2);
  });
  it('deve exibir badge quando fornecido', () => {
    const el: HTMLElement = fixture.nativeElement;
    const badge = el.querySelector('.bg-red-500');
    expect(badge?.textContent?.trim()).toBe('3');
  });
  it('deve exibir labels quando showLabels é true', () => {
    const el: HTMLElement = fixture.nativeElement;
    const label = el.querySelector('.text-xxs');
    expect(label?.textContent?.trim()).toBe('Cardápio');
  });
});
