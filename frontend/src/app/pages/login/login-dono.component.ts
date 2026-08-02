import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login-dono',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login-dono.component.html',
  styleUrls: ['./login-dono.component.css'],
})
export class LoginDonoComponent {
  username = signal('');
  password = signal('');
  showPassword = signal(false);
  carregando = signal(false);
  erro = signal(false);
  mensagemErro = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  podeEntrar(): boolean {
    return this.username().trim().length >= 3 && this.password().trim().length >= 3;
  }

  entrar(): void {
    if (!this.podeEntrar()) return;

    this.carregando.set(true);
    this.erro.set(false);

    this.authService.loginDono(this.username().trim(), this.password()).subscribe({
      next: () => {
        this.carregando.set(false);
        this.router.navigate(['/dono/dashboard']);
      },
      error: (err: any) => {
        this.carregando.set(false);
        this.erro.set(true);
        this.mensagemErro.set(err?.mensagemAmigavel || err?.message || 'Erro ao fazer login.');
      },
    });
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }
}
