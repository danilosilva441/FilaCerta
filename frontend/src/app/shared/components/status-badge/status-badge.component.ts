import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeStatus =
  | 'RECEBIDO'
  | 'PREPARANDO'
  | 'PRONTO'
  | 'ENTREGUE'
  | 'CANCELADO'
  | 'PENDENTE'
  | 'AGUARDANDO'
  | 'PAGO'
  | 'FIADO'
  | 'ABERTA'
  | 'FECHADA';

interface BadgeConfig {
  colorClass: string;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.css'],
})
export class StatusBadgeComponent {
  @Input() status: BadgeStatus = 'RECEBIDO';
  @Input() label?: string;
  @Input() showIcon = true;
  @Input() size: 'sm' | 'md' = 'md';

  private readonly badgeConfigs: Record<BadgeStatus, BadgeConfig> = {
    RECEBIDO: {
      colorClass: 'bg-blue-100 text-blue-700',
      icon: 'inbox',
      label: 'Recebido',
    },
    PREPARANDO: {
      colorClass: 'bg-orange-100 text-orange-700',
      icon: 'cooking',
      label: 'Preparando',
    },
    PRONTO: {
      colorClass: 'bg-green-100 text-green-700',
      icon: 'check_circle',
      label: 'Pronto',
    },
    ENTREGUE: {
      colorClass: 'bg-gray-100 text-gray-600',
      icon: 'local_shipping',
      label: 'Entregue',
    },
    CANCELADO: {
      colorClass: 'bg-red-100 text-red-700',
      icon: 'cancel',
      label: 'Cancelado',
    },
    PENDENTE: {
      colorClass: 'bg-gray-100 text-gray-500',
      icon: 'hourglass_empty',
      label: 'Pendente',
    },
    AGUARDANDO: {
      colorClass: 'bg-yellow-100 text-yellow-700',
      icon: 'schedule',
      label: 'Aguardando',
    },
    PAGO: {
      colorClass: 'bg-green-100 text-green-700',
      icon: 'paid',
      label: 'Pago',
    },
    FIADO: {
      colorClass: 'bg-purple-100 text-purple-700',
      icon: 'receipt_long',
      label: 'Fiado',
    },
    ABERTA: {
      colorClass: 'bg-green-100 text-green-700',
      icon: 'lock_open',
      label: 'Aberta',
    },
    FECHADA: {
      colorClass: 'bg-gray-100 text-gray-500',
      icon: 'lock',
      label: 'Fechada',
    },
  };

  get config(): BadgeConfig {
    return (
      this.badgeConfigs[this.status] || {
        colorClass: 'bg-gray-100 text-gray-600',
        icon: 'help',
        label: this.status,
      }
    );
  }

  get colorClass(): string {
    return this.config.colorClass;
  }

  get icon(): string {
    return this.config.icon;
  }

  get displayLabel(): string {
    return this.label || this.config.label;
  }

  get isPreparing(): boolean {
    return this.status === 'PREPARANDO';
  }

  get sizeClass(): string {
    const classes: Record<string, string> = {
      sm: 'text-xxs px-2 py-0.5 gap-0.5',
      md: 'text-xs px-2.5 py-1 gap-1',
    };
    return classes[this.size] || classes['md'];
  }
}
