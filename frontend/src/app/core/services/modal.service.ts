import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { ModalConfig } from '../models/modal.config';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  /**
   * BehaviorSubject (e não Subject): guarda o estado atual.
   * Assim o ConfirmModalComponent recebe o modal já aberto mesmo se
   * montar depois da chamada de `abrir()`.
   */
  private readonly modalSubject = new BehaviorSubject<ModalConfig | null>(null);

  /** Observable que o componente `ConfirmModalComponent` escuta */
  readonly modal$: Observable<ModalConfig | null> = this.modalSubject.asObservable();

  /** Snapshot síncrono do modal atual (útil em guards, testes e interceptor). */
  get modalAtual(): ModalConfig | null {
    return this.modalSubject.value;
  }

  get estaAberto(): boolean {
    return this.modalSubject.value !== null;
  }

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
    // Evita emissão redundante de `null` quando já está fechado.
    if (this.modalSubject.value === null) return;
    this.modalSubject.next(null);
  }
}
