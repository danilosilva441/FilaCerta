import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  titulo: string;
  mensagem: string;
  tipo: 'sucesso' | 'erro' | 'aviso' | 'info';
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  // ==========================================
  // 1. SISTEMA DE TOASTS (Avisos visuais)
  // ==========================================
  private toastSubject = new Subject<ToastMessage>();
  toast$ = this.toastSubject.asObservable();

  sucesso(titulo: string, mensagem: string): void {
    this.toastSubject.next({ titulo, mensagem, tipo: 'sucesso' });
  }

  erro(titulo: string, mensagem: string): void {
    this.toastSubject.next({ titulo, mensagem, tipo: 'erro' });
  }

  aviso(titulo: string, mensagem: string): void {
    this.toastSubject.next({ titulo, mensagem, tipo: 'aviso' });
  }

  // ==========================================
  // 2. SISTEMA DE ÁUDIO E HARDWARE (MP3 e Vibração)
  // ==========================================

  // Aponta direto para o arquivo que você mostrou na imagem
  private audio = new Audio('assets/sounds/notification.mp3');

  // Método chamado no primeiro clique do usuário para o navegador não bloquear o som
  desbloquearAudioBrowser(): void {
    // 1. Força o celular a baixar o MP3 na hora do clique
    this.audio.load();
    this.audio.volume = 1.0; // Garante volume máximo no HTML5

    // 2. Toca e pausa imediatamente de forma segura (tratando a Promise)
    const playPromise = this.audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.audio.pause();
          this.audio.currentTime = 0;
          console.log('✅ Áudio desbloqueado com sucesso no mobile!');
        })
        .catch((error) => {
          console.warn('⚠️ Celular bloqueou o desbloqueio silencioso:', error);
        });
    }
  }

  tocarSino(): void {
    this.audio.currentTime = 0; // Volta para o início do som
    this.audio.play().catch((e) => {
      console.warn('O navegador bloqueou o áudio. Tentando vibrar como plano B.', e);
      this.vibrar();
    });
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
