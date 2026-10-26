export type ModalTipo = 'aviso' | 'perigo' | 'info' | 'sucesso';

export interface ModalConfig {
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  tipo?: ModalTipo;
  onConfirm: () => void;
}
