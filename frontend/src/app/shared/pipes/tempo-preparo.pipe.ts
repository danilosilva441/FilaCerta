import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'tempoPreparo', standalone: true })
export class TempoPreparoPipe implements PipeTransform {
  transform(minutos: number): string {
    if (minutos === 0) return 'Imediato';
    if (minutos < 60) return `${minutos}min`;
    const horas = Math.floor(minutos / 60);
    const resto = minutos % 60;
    return resto > 0 ? `${horas}h ${resto}min` : `${horas}h`;
  }
}
