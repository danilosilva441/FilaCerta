import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  templateUrl: './loading-spinner.component.html',
  // OnPush: O componente só re-renderiza se o 'message' ou 'size' mudarem.
  // Excelente para economizar processamento enquanto a animação roda na tela.
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSpinnerComponent {
  /** Mensagem opcional para exibir abaixo do spinner (ex: "Carregando cardápio...") */
  @Input() message?: string;

  /** Define o tamanho do spinner. Padrão: 'md' */
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
}
