import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';

@Component({
  selector: 'app-sobre-contato',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sobre-contato.html',
  styleUrls: ['./sobre-contato.css'],
})
export class SobreContatoComponent {
  private readonly location = inject(Location);

  voltar(): void {
    this.location.back();
  }
}
