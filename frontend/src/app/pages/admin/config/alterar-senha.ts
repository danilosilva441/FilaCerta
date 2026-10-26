import { CommonModule, Location } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { AlterarSenhaRequest } from '../../../core/models/usuario.modal';

@Component({
  selector: 'app-alterar-senha',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './alterar-senha.html',
  styleUrls: ['./alterar-senha.css'],
})
export class AlterarSenhaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private readonly notificationService = inject(NotificationService);
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  isLoading = signal<boolean>(false);

  /** Estado de visibilidade de cada senha (olhinho) */
  mostrarSenhaAtual = signal<boolean>(false);
  mostrarNovaSenha = signal<boolean>(false);
  mostrarConfirmarSenha = signal<boolean>(false);

  form =this.fb.nonNullable.group({
    senhaAtual: ['', [Validators.required]],
    novaSenha: ['', [Validators.required, Validators.minLength(6)]],
    confirmarSenhaNova: ['', [Validators.required]],
  }, {
    validators: this.senhasIguaisValidator.bind(this)
  });

 private senhasIguaisValidator(group: AbstractControl): ValidationErrors | null {
    const novaSenha = group.get('novaSenha')?.value;
    const confirmar = group.get('confirmarSenhaNova')?.value;
    return novaSenha === confirmar ? null : { senhasDiferentes: true };
  }

  /** Alterna visibilidade da senha atual */
  toggleSenhaAtual(): void {
    this.mostrarSenhaAtual.update((v) => !v);
  }

  /** Alterna visibilidade da nova senha */
  toggleNovaSenha(): void {
    this.mostrarNovaSenha.update((v) => !v);
  }

  /** Alterna visibilidade da confirmação */
  toggleConfirmarSenha(): void {
    this.mostrarConfirmarSenha.update((v) => !v);
  }

  /** Volta para a página anterior (ou /caixa/painel como fallback) */
  voltar(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/caixa/painel']);
    }
  }

onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading.set(true);

    this.usuarioService.alterarSenha(this.form.getRawValue() as AlterarSenhaRequest).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.notificationService.sucesso(
          'Senha Atualizada',
          'Sessão encerrada por segurança. Faça login com a nova senha.'
        );

        // Limpa o token velho e manda o usuário para a tela de login
        this.authService.logout();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading.set(false);
        const mensagem =
          err.error?.mensagem ||
          err.error?.message ||
          'Não foi possível alterar a senha.';
        this.notificationService.erro('Erro', mensagem);
      },
    });
  }
}
