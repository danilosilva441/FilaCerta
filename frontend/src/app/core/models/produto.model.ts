export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  categoria?: any;
  tempoPreparoMinutos: number;
  disponivel: boolean;
  categoriaId: number; // Adicionando a propriedade categoriaId

  quantidadeDisponivel?: number; // Adicionando a propriedade quantidadeDisponivel como opcional
  limiteDiario?: number; // Adicionando a propriedade limiteDiario como opcional
  ativo?: boolean; // Adicionando a propriedade ativo como opcional
}
