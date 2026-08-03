import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterModule], // CommonModule removido para poupar KB do bundle!
  templateUrl: './bottom-nav.component.html',
  // OnPush aqui é excelente porque o menu não fica se re-renderizando a cada clique interno do app
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomNavComponent {
  @Input() items: NavItem[] = [];
  @Input() showLabels = true;
}
