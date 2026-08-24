export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  categoria: 'HAMBURGUER' | 'CACHORRO_QUENTE' | 'SALGADO' | 'BEBIDA' | 'PORCAO' | 'ADICIONAL';
  tempoPreparoMinutos: number;
}
