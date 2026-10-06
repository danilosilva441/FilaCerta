import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  username = '';
  password = '';
  isLoading = false;
  mensagemErro = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
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
        this.notificationService.sucesso('Bem-vindo!', 'Login realizado com sucesso.');
        this.router.navigate(['/caixa/painel']);
      },
      error: (err) => {
        console.error(err);

        if (err.status === 429) {
          this.notificationService.erro(
            'Bloqueado',
            'Muitas tentativas incorretas. Por segurança, aguarde 5 minutos.',
          );
        } else if (err.status === 401) {
          this.notificationService.erro('Acesso Negado', 'Usuário ou senha incorretos.');
        } else {
          this.notificationService.erro(
            'Erro',
            'Ocorreu um erro ao tentar fazer login. Verifique sua conexão.',
          );
        }

        this.isLoading = false; // Corrigido para desligar o spinner corretamente
      },
    });
  }
}
