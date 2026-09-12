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
  desbloquearAudioBrowser() {
    throw new Error('Method not implemented.');
  }
  tocarSino() {
    throw new Error('Method not implemented.');
  }
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
}
