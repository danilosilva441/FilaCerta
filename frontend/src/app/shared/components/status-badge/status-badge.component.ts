import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
// Importação do CommonModule foi removida propositalmente (veja a explicação abaixo)

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

/*
  1. OTIMIZAÇÃO DE MEMÓRIA:
  Mover o dicionário para fora da classe faz com que ele seja criado apenas UMA vez
  na memória do celular do cliente, em vez de ser recriado toda vez que um pedido
  novo aparecer na tela. Se tiver 50 pedidos na tela, economizamos 50 instâncias.
*/
const BADGE_CONFIGS: Record<BadgeStatus, BadgeConfig> = {
  RECEBIDO: { colorClass: 'bg-blue-100 text-blue-700', icon: 'inbox', label: 'Recebido' },
  PREPARANDO: { colorClass: 'bg-orange-100 text-orange-700', icon: 'soup_kitchen', label: 'Preparando' }, // Dica: 'cooking' não é um ícone padrão do Google, alterei para 'soup_kitchen' que existe.
  PRONTO: { colorClass: 'bg-green-100 text-green-700', icon: 'check_circle', label: 'Pronto' },
  ENTREGUE: { colorClass: 'bg-gray-100 text-gray-600', icon: 'local_shipping', label: 'Entregue' },
  CANCELADO: { colorClass: 'bg-red-100 text-red-700', icon: 'cancel', label: 'Cancelado' },
  PENDENTE: { colorClass: 'bg-gray-100 text-gray-500', icon: 'hourglass_empty', label: 'Pendente' },
  AGUARDANDO: { colorClass: 'bg-yellow-100 text-yellow-700', icon: 'schedule', label: 'Aguardando' },
  PAGO: { colorClass: 'bg-green-100 text-green-700', icon: 'paid', label: 'Pago' },
  FIADO: { colorClass: 'bg-purple-100 text-purple-700', icon: 'receipt_long', label: 'Fiado' },
  ABERTA: { colorClass: 'bg-green-100 text-green-700', icon: 'lock_open', label: 'Aberta' },
  FECHADA: { colorClass: 'bg-gray-100 text-gray-500', icon: 'lock', label: 'Fechada' },
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.css'],
  // 2. OTIMIZAÇÃO DE PERFORMANCE EXTREMA:
  // Como esse componente só depende dos @Inputs, o OnPush avisa o Angular para não checar
  // ele desnecessariamente. Isso economiza muita bateria e processamento no celular.
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  @Input() status: BadgeStatus = 'RECEBIDO';
  @Input() label?: string;
  @Input() showIcon = true;
  @Input() size: 'sm' | 'md' = 'md';

  get config(): BadgeConfig {
    return BADGE_CONFIGS[this.status] || {
      colorClass: 'bg-gray-100 text-gray-600',
      icon: 'help',
      label: this.status,
    };
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
      // O Tailwind não possui 'text-xxs' por padrão. Usei text-[10px] para forçar o tamanho correto.
      sm: 'text-[10px] px-2 py-0.5 gap-1',
      md: 'text-xs px-2.5 py-1 gap-1.5',
    };
    return classes[this.size] || classes['md'];
  }
}
