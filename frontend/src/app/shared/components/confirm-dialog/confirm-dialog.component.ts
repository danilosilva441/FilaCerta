import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css'],
})
export class ConfirmDialogComponent {
  @Input() visible = false;
  @Input() title = 'Confirmação';
  @Input() message = 'Tem certeza?';
  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';
  @Input() type: 'info' | 'warning' | 'danger' = 'info';

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  get icon(): string {
    const icons: Record<string, string> = {
      info: 'info',
      warning: 'warning',
      danger: 'error',
    };
    return icons[this.type] || 'help';
  }

  get iconColorClass(): string {
    const classes: Record<string, string> = {
      info: 'text-primary-600',
      warning: 'text-yellow-500',
      danger: 'text-red-500',
    };
    return classes[this.type] || 'text-primary-600';
  }

  get confirmButtonClass(): string {
    const classes: Record<string, string> = {
      info: 'bg-primary-600 hover:bg-primary-700',
      warning: 'bg-yellow-600 hover:bg-yellow-700',
      danger: 'bg-red-600 hover:bg-red-700',
    };
    return classes[this.type] || 'bg-primary-600 hover:bg-primary-700';
  }
}
