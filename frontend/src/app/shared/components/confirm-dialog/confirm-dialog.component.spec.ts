import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('não deve renderizar quando visible for false', () => {
    component.visible = false;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const dialog = el.querySelector('[role="dialog"]');
    expect(dialog).toBeNull();
  });

  it('deve renderizar quando visible for true', () => {
    component.visible = true;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const dialog = el.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
  });

  it('deve exibir o título correto', () => {
    component.visible = true;
    component.title = 'Título do Teste';
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const title = el.querySelector('#dialog-title');
    expect(title?.textContent?.trim()).toBe('Título do Teste');
  });

  it('deve exibir a mensagem correta', () => {
    component.visible = true;
    component.message = 'Mensagem de teste';
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const message = el.querySelector('p');
    expect(message?.textContent?.trim()).toBe('Mensagem de teste');
  });

  it('deve emitir onConfirm ao clicar no botão confirmar', () => {
    component.visible = true;
    const emitSpy = vi.spyOn(component.onConfirm, 'emit');
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    const confirmBtn = buttons[1] as HTMLButtonElement; // Segundo botão
    confirmBtn.click();
    expect(emitSpy).toHaveBeenCalled();
  });

  it('deve emitir onCancel ao clicar no botão cancelar', () => {
    component.visible = true;
    const emitSpy = vi.spyOn(component.onCancel, 'emit');
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    const cancelBtn = buttons[0] as HTMLButtonElement; // Primeiro botão
    cancelBtn.click();
    expect(emitSpy).toHaveBeenCalled();
  });

  it('deve emitir onCancel ao clicar no overlay', () => {
    component.visible = true;
    const emitSpy = vi.spyOn(component.onCancel, 'emit');
    fixture.detectChanges();

    const overlay = fixture.nativeElement.querySelector('.absolute') as HTMLDivElement;
    overlay.click();
    expect(emitSpy).toHaveBeenCalled();
  });

  it('deve retornar ícone correto para cada tipo', () => {
    component.type = 'info';
    expect(component.icon).toBe('info');
    component.type = 'warning';
    expect(component.icon).toBe('warning');
    component.type = 'danger';
    expect(component.icon).toBe('error');
  });

  it('deve ter classe de cor correta para botão danger', () => {
    component.type = 'danger';
    expect(component.confirmButtonClass).toContain('bg-red-600');
  });
});
