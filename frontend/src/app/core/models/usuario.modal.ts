export interface AlterarSenhaRequest {
  senhaAtual: string;
  novaSenha: string;
  confirmarSenhaNova: string;
}

export interface CriarUsuarioRequest {
  username?: string;
  password?: string;
  role?: string;
}
