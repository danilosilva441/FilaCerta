import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
})
export class LoginComponent {
  username = '';
  password = '';
  isLoading = false;
  mensagemErro = '';
  login: any;
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  fazerLogin(): void {
    if (!this.username || !this.password) {
      this.mensagemErro = 'Preencha usuário e senha!';
      return;
    }

    this.isLoading = true;
    this.mensagemErro = '';

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.isLoading = false;
        // Se deu certo, joga o dono lá pro painel do Caixa!
        this.router.navigate(['/caixa/painel']);
      },
      error: (err) => {
        this.isLoading = false;
        this.mensagemErro = 'Acesso Negado! Usuário ou senha incorretos.';
        console.error(err);
      },
    });
  }
}
