import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  @Input() title = 'Fila Certa';
  @Input() subtitle?: string;
  @Input() showBack = false;
  @Input() backRoute?: string;
  @Input() rightAction?: {
    icon: string;
    label: string;
    handler: () => void;
  };

  goBack(): void {
    if (this.backRoute) {
      // Navegação programática será feita via Router no template
    } else {
      window.history.back();
    }
  }
}
