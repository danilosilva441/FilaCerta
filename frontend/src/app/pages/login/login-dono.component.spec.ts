import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginDonoComponent } from './login-dono.component';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('LoginDonoComponent', () => {
  let component: LoginDonoComponent;
  let fixture: ComponentFixture<LoginDonoComponent>;
  let authServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    authServiceMock = {
      loginDono: vi.fn().mockReturnValue(of({ success: true, tipo: 'DONO' })),
    };
    routerMock = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [LoginDonoComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginDonoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => expect(component).toBeTruthy());

  it('deve validar campos obrigatórios', () => {
    component.username.set('dono');
    component.password.set('123');
    expect(component.podeEntrar()).toBe(true);
  });

  it('deve fazer login com sucesso', () => {
    component.username.set('dono');
    component.password.set('123456');
    component.entrar();
    expect(authServiceMock.loginDono).toHaveBeenCalledWith('dono', '123456');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dono/dashboard']);
  });

  it('deve mostrar erro no login', () => {
    authServiceMock.loginDono.mockReturnValue(throwError(() => new Error('Senha incorreta')));
    component.entrar();
    expect(component.erro()).toBe(true);
  });

  it('deve alternar visibilidade da senha', () => {
    expect(component.showPassword()).toBe(false);
    component.togglePassword();
    expect(component.showPassword()).toBe(true);
  });
});
