import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login-cliente.component.html',
  styleUrls: ['./login-cliente.component.css'],
})
export class LoginClienteComponent {
  // ... resto do código permanece igual
  isLogin = true;
  codigo = signal('');
  nome = signal('');
  sobrenome = signal('');
  carregando = signal(false);
  erro = signal(false);
  mensagemErro = signal('');
  sucesso = signal(false);
  codigoGerado = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  podeLogin(): boolean {
    return this.codigo().trim().length >= 3;
  }

  podeCadastrar(): boolean {
    return this.nome().trim().length >= 2 && this.sobrenome().trim().length >= 2;
  }

  fazerLogin(): void {
    if (!this.podeLogin()) return;
    this.carregando.set(true);
    this.erro.set(false);

    this.authService.loginCliente(this.codigo().trim().toUpperCase()).subscribe({
      next: () => {
        this.carregando.set(false);
        this.router.navigate(['/cliente/cardapio']);
      },
      error: (err: Error) => {
        this.carregando.set(false);
        this.erro.set(true);
        this.mensagemErro.set(err.message);
      },
    });
  }

  fazerCadastro(): void {
    if (!this.podeCadastrar()) return;
    this.carregando.set(true);
    this.erro.set(false);

    this.authService.registrarCliente(
      this.nome().trim(),
      this.sobrenome().trim()
    ).subscribe({
      next: (res) => {
        this.carregando.set(false);
        this.sucesso.set(true);
        this.codigoGerado.set(res.codigoCliente || '');
        setTimeout(() => this.router.navigate(['/cliente/cardapio']), 3000);
      },
      error: (err: Error) => {
        this.carregando.set(false);
        this.erro.set(true);
        this.mensagemErro.set(err.message);
      },
    });
  }

  toggleModo(): void {
    this.isLogin = !this.isLogin;
    this.erro.set(false);
    this.sucesso.set(false);
  }
}
