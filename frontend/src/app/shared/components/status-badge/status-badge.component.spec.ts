import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusBadgeComponent, BadgeStatus } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  let component: StatusBadgeComponent;
  let fixture: ComponentFixture<StatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve ter status padrão RECEBIDO', () => {
    expect(component.status).toBe('RECEBIDO');
  });

  it('deve exibir label padrão para RECEBIDO', () => {
    const el: HTMLElement = fixture.nativeElement;
    const span = el.querySelector('span');
    expect(span?.getAttribute('aria-label')).toBe('Recebido');
  });

  it('deve exibir label personalizada', () => {
    component.status = 'PRONTO';
    component.label = 'Já pode retirar!';
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const span = el.querySelector('span');
    expect(span?.getAttribute('aria-label')).toBe('Já pode retirar!');
  });

  it('deve ter classe de cor azul para RECEBIDO', () => {
    expect(component.colorClass).toContain('bg-blue-100');
    expect(component.colorClass).toContain('text-blue-700');
  });

  it('deve ter classe de cor verde para PRONTO', () => {
    component.status = 'PRONTO';
    fixture.detectChanges();
    expect(component.colorClass).toContain('bg-green-100');
    expect(component.colorClass).toContain('text-green-700');
  });

  it('deve ter classe de cor laranja para PREPARANDO', () => {
    component.status = 'PREPARANDO';
    fixture.detectChanges();
    expect(component.colorClass).toContain('bg-orange-100');
    expect(component.colorClass).toContain('text-orange-700');
  });

  it('deve ter classe de cor vermelha para CANCELADO', () => {
    component.status = 'CANCELADO';
    fixture.detectChanges();
    expect(component.colorClass).toContain('bg-red-100');
    expect(component.colorClass).toContain('text-red-700');
  });

  it('deve ter animação pulse quando PREPARANDO', () => {
    component.status = 'PREPARANDO';
    expect(component.isPreparing).toBe(true);

    component.status = 'PRONTO';
    expect(component.isPreparing).toBe(false);
  });

  it('deve exibir ícone por padrão', () => {
    component.showIcon = true;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const icon = el.querySelector('.material-icons');
    expect(icon).not.toBeNull();
  });

  it('deve esconder ícone quando showIcon é false', () => {
    component.showIcon = false;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const icon = el.querySelector('.material-icons');
    expect(icon).toBeNull();
  });

  it('deve ter tamanho md por padrão', () => {
    expect(component.size).toBe('md');
  });

  it('deve aplicar tamanho sm corretamente', () => {
    component.size = 'sm';
    fixture.detectChanges();
    expect(component.sizeClass).toContain('text-xxs');
  });

  it('deve retornar ícone correto para cada status', () => {
    const testCases: [BadgeStatus, string][] = [
      ['RECEBIDO', 'inbox'],
      ['PREPARANDO', 'cooking'],
      ['PRONTO', 'check_circle'],
      ['ENTREGUE', 'local_shipping'],
      ['CANCELADO', 'cancel'],
      ['PENDENTE', 'hourglass_empty'],
      ['AGUARDANDO', 'schedule'],
      ['PAGO', 'paid'],
      ['FIADO', 'receipt_long'],
      ['ABERTA', 'lock_open'],
      ['FECHADA', 'lock'],
    ];

    testCases.forEach(([status, expectedIcon]) => {
      component.status = status;
      expect(component.icon).toBe(expectedIcon);
    });
  });

  it('deve ter role status para acessibilidade', () => {
    const el: HTMLElement = fixture.nativeElement;
    const span = el.querySelector('[role="status"]');
    expect(span).not.toBeNull();
  });
});
