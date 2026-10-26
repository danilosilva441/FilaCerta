import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ToastMessage, TipoToast } from '../models/notification.modal';


@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly toastSubject = new Subject<ToastMessage>();

  /** Observable para o componente Toast escutar */
  readonly toast$ = this.toastSubject.asObservable();

  // ====== Métodos públicos ======

  sucesso(titulo: string, mensagem: string): void {
    this.toastSubject.next({ titulo, mensagem, tipo: 'sucesso' });
  }

  erro(titulo: string, mensagem: string): void {
    this.toastSubject.next({ titulo, mensagem, tipo: 'erro' });
  }

  aviso(titulo: string, mensagem: string): void {
    this.toastSubject.next({ titulo, mensagem, tipo: 'aviso' });
  }

  info(titulo: string, mensagem: string): void {
    this.toastSubject.next({ titulo, mensagem, tipo: 'info' });
  }

  /**
   * Toast de confirmação com 2 botões (ação + cancelar).
   * Fica visível por mais tempo e bloqueia a ação até o usuário decidir.
   *
   * @example
   * notification.confirmar(
   *   'Entregar pedido?',
   *   'Confirme que o lanche foi entregue e o cliente já pagou.',
   *   () => this.executarEntrega(pedidoId),
   *   { textoAcao: 'Sim, entregar', textoCancelar: 'Voltar' },
   * );
   */
  confirmar(
    titulo: string,
    mensagem: string,
    onConfirmar: () => void,
    opcoes?: {
      textoAcao?: string;
      textoCancelar?: string;
      tipo?: TipoToast;
    },
  ): void {
    this.toastSubject.next({
      titulo,
      mensagem,
      tipo: opcoes?.tipo ?? 'aviso',
      textoAcao: opcoes?.textoAcao ?? 'Confirmar',
      textoCancelar: opcoes?.textoCancelar ?? 'Cancelar',
      onAcao: onConfirmar,
    });
  }
}
