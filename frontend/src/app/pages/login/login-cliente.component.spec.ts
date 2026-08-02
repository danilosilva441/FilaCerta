import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginClienteComponent } from './login-cliente.component';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('LoginClienteComponent', () => {
  let component: LoginClienteComponent;
  let fixture: ComponentFixture<LoginClienteComponent>;
  let authServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    authServiceMock = {
      loginCliente: vi.fn().mockReturnValue(of({ success: true })),
      registrarCliente: vi.fn().mockReturnValue(of({ success: true, codigoCliente: 'CLI-0001' })),
    };
    routerMock = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [LoginClienteComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => expect(component).toBeTruthy());
  it('deve iniciar em modo login', () => expect(component.isLogin).toBe(true));
  it('deve alternar entre login e cadastro', () => {
    component.toggleModo();
    expect(component.isLogin).toBe(false);
  });
  it('deve validar código mínimo 3 caracteres', () => {
    component.codigo.set('AB');
    expect(component.podeLogin()).toBe(false);
    component.codigo.set('CLI');
    expect(component.podeLogin()).toBe(true);
  });
  it('deve fazer login com sucesso', () => {
    component.codigo.set('CLI-0001');
    component.fazerLogin();
    expect(authServiceMock.loginCliente).toHaveBeenCalledWith('CLI-0001');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/cardapio']);
  });
  it('deve mostrar erro no login', () => {
    authServiceMock.loginCliente.mockReturnValue(throwError(() => new Error('Código inválido')));
    component.codigo.set('CLI-0001');
    component.fazerLogin();
    expect(component.erro()).toBe(true);
  });
  it('deve validar nome e sobrenome no cadastro', () => {
    component.nome.set('Jo');
    component.sobrenome.set('Si');
    expect(component.podeCadastrar()).toBe(true);
  });
});
