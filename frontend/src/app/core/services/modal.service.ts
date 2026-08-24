import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ModalConfig {
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  onConfirm: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modalSubject = new Subject<ModalConfig | null>();
  modal$ = this.modalSubject.asObservable();

  confirmar(config: ModalConfig): void {
    this.modalSubject.next(config);
  }

  fechar(): void {
    this.modalSubject.next(null);
  }
}
