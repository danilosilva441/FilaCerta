import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  tocarAlerta(tipo: 'novo-pedido' | 'pedido-pronto' | 'erro' = 'pedido-pronto'): void {
    try {
      const audio = new Audio(`assets/sounds/${tipo}.mp3`);
      audio.volume = 0.7;
      audio.play().catch(() => this.vibrar());
    } catch {
      this.vibrar();
    }
  }

  vibrar(padrao: number[] = [200, 100, 200]): void {
    if ('vibrate' in navigator) {
      navigator.vibrate(padrao);
    }
  }

  async notificarSistema(titulo: string, corpo: string): Promise<void> {
    if (!('Notification' in window)) return;
    const permissao = await Notification.requestPermission();
    if (permissao === 'granted') {
      new Notification(titulo, {
        body: corpo,
        icon: 'assets/icons/notification-icon.png',
        tag: 'filacerta-notification',
      });
    }
  }
}
