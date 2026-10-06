import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lgpd-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lgpd-banner.component.html',  // ← extrair o template
  styleUrls: ['./lgpd-banner.component.css'],   // ← adicionar
})
export class LgpdBannerComponent {
  readonly aceito = signal<boolean>(localStorage.getItem('filacerta_lgpd_aceito') === 'true');

  aceitarTermos(): void {
    try {
      localStorage.setItem('filacerta_lgpd_aceito', 'true');
    } catch {
      // Modo privado do Safari: falha silenciosa
    }
    this.aceito.set(true);
  }
}
