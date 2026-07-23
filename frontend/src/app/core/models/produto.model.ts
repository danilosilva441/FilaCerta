export type CategoriaProduto =
  | 'HAMBURGUER'
  | 'CACHORRO_QUENTE'
  | 'SALGADO'
  | 'BEBIDA'
  | 'PORCAO'
  | 'ADICIONAL';

export interface ProdutoResponse {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  categoria: CategoriaProduto;
  tempoPreparoMinutos: number;
  disponivel: boolean;
}
