import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, ToastMessage } from '../../../core/services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
})
export class ToastComponent implements OnInit, OnDestroy {
  toast: ToastMessage | null = null;
  private subscription?: Subscription;
  private timeoutId?: any;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.toast$.subscribe((mensagem) => {
      this.toast = mensagem;

      // Limpa o toast anterior se houver
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }

      // Faz o toast sumir após 4 segundos
      this.timeoutId = setTimeout(() => {
        this.fechar();
      }, 4000);
    });
  }

  fechar(): void {
    this.toast = null;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }
}
