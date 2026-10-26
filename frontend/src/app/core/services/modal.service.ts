import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ModalConfig, ModalTipo } from '../models/modal.config';


@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private readonly modalSubject = new Subject<ModalConfig | null>();

  /** Observable que o componente `ConfirmModalComponent` escuta */
  readonly modal$ = this.modalSubject.asObservable();

  /**
   * Abre o modal de confirmação.
   * Este é o método principal — use este nome.
   */
  abrir(config: ModalConfig): void {
    this.modalSubject.next(config);
  }

  /**
   * Alias para `abrir()`. Mantido por compatibilidade com código antigo.
   * @deprecated Use `abrir()`
   */
  confirmar(config: ModalConfig): void {
    this.abrir(config);
  }

  /** Fecha o modal atual */
  fechar(): void {
    this.modalSubject.next(null);
  }
}
