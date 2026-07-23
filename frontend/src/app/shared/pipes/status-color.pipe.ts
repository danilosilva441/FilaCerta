import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'statusColor', standalone: true })
export class StatusColorPipe implements PipeTransform {
  transform(status: string): string {
    const cores: Record<string, string> = {
      'RECEBIDO': 'bg-yellow-100 text-yellow-800',
      'PREPARANDO': 'bg-orange-100 text-orange-800',
      'PRONTO': 'bg-green-100 text-green-800',
      'ENTREGUE': 'bg-blue-100 text-blue-800',
      'CANCELADO': 'bg-red-100 text-red-800',
      'PENDENTE': 'bg-gray-100 text-gray-600',
      'AGUARDANDO': 'bg-yellow-100 text-yellow-800',
      'PAGO': 'bg-green-100 text-green-800',
      'FIADO': 'bg-purple-100 text-purple-800',
      'ABERTA': 'bg-green-100 text-green-800',
      'FECHADA': 'bg-gray-100 text-gray-600',
    };
    return cores[status] || 'bg-gray-100 text-gray-600';
  }
}
