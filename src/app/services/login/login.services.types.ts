export interface LoginResponse {
  token: string;
  nome: string;
  email: string;
  perfil: string;
}

export interface LoginParams {
  email: string;
  senha: string;
}