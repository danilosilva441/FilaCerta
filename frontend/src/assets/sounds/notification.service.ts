import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private audioContext: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  tocarAlerta(tipo: 'novo-pedido' | 'pedido-pronto' | 'erro' = 'pedido-pronto'): void {
    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.type = 'sine';

      switch (tipo) {
        case 'novo-pedido':
          oscillator.frequency.setValueAtTime(880, ctx.currentTime);
          oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.3);
          break;
        case 'pedido-pronto':
          oscillator.frequency.setValueAtTime(660, ctx.currentTime);
          oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
          oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.3);
          gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.6);
          break;
        case 'erro':
          oscillator.frequency.setValueAtTime(200, ctx.currentTime);
          oscillator.frequency.setValueAtTime(150, ctx.currentTime + 0.2);
          gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.4);
          break;
      }
    } catch (e) {
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
      new Notification(titulo, { body: corpo, tag: 'filacerta-notification' });
    }
  }
}
