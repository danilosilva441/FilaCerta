import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, ToastMessage } from '../../../core/services/notification.service';

interface ToastItem extends ToastMessage {
  id: number;
  saindo?: boolean;
  timeoutId?: ReturnType<typeof setTimeout>;
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent implements OnInit, OnDestroy {
  private readonly notificationService = inject(NotificationService);
  private subscription?: Subscription;
  private proximoId = 1;

  private readonly DURACAO = 4000;
  private readonly DURACAO_COM_ACAO = 12000; // 👈 12s se tiver botões

  toasts: ToastItem[] = [];

  ngOnInit(): void {
    this.subscription = this.notificationService.toast$.subscribe((mensagem) => {
      this.adicionarToast(mensagem);
    });
  }

  private adicionarToast(mensagem: ToastMessage): void {
    const novoToast: ToastItem = {
      ...mensagem,
      id: this.proximoId++,
    };

    this.toasts = [novoToast, ...this.toasts];

    // Duração maior se tiver ação
    const duracao = mensagem.textoAcao ? this.DURACAO_COM_ACAO : this.DURACAO;

    novoToast.timeoutId = setTimeout(() => {
      this.removerToast(novoToast.id);
    }, duracao);
  }

  removerToast(id: number): void {
    const toast = this.toasts.find((t) => t.id === id);
    if (!toast || toast.saindo) return;

    toast.saindo = true;

    if (toast.timeoutId) clearTimeout(toast.timeoutId);

    setTimeout(() => {
      this.toasts = this.toasts.filter((t) => t.id !== id);
    }, 300);
  }

  /** Executa a ação e fecha o toast */
  executarAcao(item: ToastItem): void {
    item.onAcao?.();
    this.removerToast(item.id);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.toasts.forEach((t) => {
      if (t.timeoutId) clearTimeout(t.timeoutId);
    });
  }
}
