
export type TipoToast = 'sucesso' | 'erro' | 'aviso' | 'info';

export interface ToastMessage {
  titulo: string;
  mensagem: string;
  tipo: TipoToast;
  /** Texto do botão de ação (opcional). Se ausente, toast só informa. */
  textoAcao?: string;
  /** Texto do botão de cancelar (opcional). */
  textoCancelar?: string;
  /** Callback disparado quando o usuário clica no botão de ação. */
  onAcao?: () => void;
}
