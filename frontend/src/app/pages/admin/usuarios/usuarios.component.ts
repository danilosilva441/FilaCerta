import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UsuarioService } from '../../../core/services/usuario.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
})
export class UsuariosComponent {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private readonly notificationService = inject(NotificationService);

  /** Controla visibilidade da senha (olhinho) */
  moreturn = signal<boolean>(false);

  usuarioForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(4)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['DONO', [Validators.required]],
  });
  mostrarSenha: any = signal(false);
  location: any;
  router: any;

  toggleSenha(): void {
    this.mostrarSenha.update((v: any) => !v);
  }

  voltar(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/caixa/painel']);
    }
  }

  salvarUsuario(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    this.usuarioService.criarUsuario(this.usuarioForm.value).subscribe({
      next: () => {
        this.notificationService.sucesso('Usuário criado', 'O novo acesso foi criado com sucesso.');
        this.usuarioForm.reset({ role: 'DONO' });
      },
      error: (err) => {
        console.error(err);
        const mensagem =
          err.error?.mensagem ||
          err.error?.message ||
          'Erro ao criar usuário. Verifique as permissões.';
        this.notificationService.erro('Erro', mensagem);
      },
    });
  }
}
