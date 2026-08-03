import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common'; // Serviço nativo do Angular para navegação

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule], // CommonModule removido (não é mais necessário)
  templateUrl: './header.component.html',
  // OnPush economiza bateria e processamento no celular, pois o cabeçalho muda pouco.
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  // Nota: No primeiro código o título era 'Bora Rochedo', aqui está 'Fila Certa'.
  // Mantive o seu padrão atual.
  @Input() title = 'Fila Certa';
  @Input() subtitle?: string;
  @Input() showBack = false;
  @Input() backRoute?: string;
  @Input() rightAction?: {
    icon: string;
    label: string;
    handler: () => void;
  };

  // Injecão de dependência moderna do Angular
  private location = inject(Location);

  goBack(): void {
    if (!this.backRoute) {
      // Substitui o `window.history.back()` pela API oficial do Angular.
      // Isso evita bugs no roteador interno da aplicação e é mais seguro.
      this.location.back();
    }
  }
}
