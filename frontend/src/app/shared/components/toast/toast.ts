import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../../core/services/notification.service';
import { ToastMessage, TipoToast } from '../../../core/models/notification.modal';

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
  styleUrls: ['./toast.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent implements OnInit, OnDestroy {
  private readonly notificationService = inject(NotificationService);
  // 1. INJETAMOS O DETECTOR DE MUDANÇAS
  private readonly cdr = inject(ChangeDetectorRef);

  private subscription?: Subscription;
  private proximoId = 1;

  private readonly DURACAO = 4000;
  private readonly DURACAO_COM_ACAO = 12000;

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

    // 2. AVISAMOS O ANGULAR PARA DESENHAR O BALÃO NA TELA AGORA
    this.cdr.detectChanges();

    const duracao = mensagem.textoAcao ? this.DURACAO_COM_ACAO : this.DURACAO;

    novoToast.timeoutId = setTimeout(() => {
      this.removerToast(novoToast.id);
    }, duracao);
  }

  removerToast(id: number): void {
    const toast = this.toasts.find((t) => t.id === id);
    if (!toast || toast.saindo) return;

    toast.saindo = true;

    // Atualiza a tela para tocar a animação de saída
    this.cdr.detectChanges();

    if (toast.timeoutId) clearTimeout(toast.timeoutId);

    setTimeout(() => {
      this.toasts = this.toasts.filter((t) => t.id !== id);
      // Atualiza a tela para remover o balão do HTML de vez
      this.cdr.detectChanges();
    }, 300);
  }

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
