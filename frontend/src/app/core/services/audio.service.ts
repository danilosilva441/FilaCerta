import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private readonly audio: HTMLAudioElement;
  private desbloqueado = false;

  constructor() {
    this.audio = new Audio('assets/audios/sino.mp3');
    this.audio.preload = 'auto';
    this.audio.volume = 0.7;
  }

  /**
   * Desbloqueia o áudio no Chrome/Safari.
   * Deve ser chamado dentro de um gesto do usuário (click, touch).
   */
  desbloquear(): void {
    if (this.desbloqueado) return;

    this.audio
      .play()
      .then(() => {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.desbloqueado = true;
      })
      .catch(() => {
        // Ainda bloqueado — o usuário precisa interagir mais
      });
  }

  /**
   * Toca o sino. Se o áudio ainda estiver bloqueado, não faz nada.
   */
  tocarSino(): void {
    if (!this.desbloqueado) return;

    try {
      this.audio.currentTime = 0;
      this.audio.play().catch((err) => console.warn('Falha ao tocar áudio:', err));
    } catch (e) {
      console.warn('Erro ao tocar sino:', e);
    }

    // Vibração em Android
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200]);
      } catch {
        /* ignore */
      }
    }
  }

  estaDesbloqueado(): boolean {
    return this.desbloqueado;
  }
}
