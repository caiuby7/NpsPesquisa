import { API_URL } from '../../config/api-url';

interface TotvsLoginResponse {
  token: string;
  nome: string;
  email: string;
  perfil: string;
}

export class TotvsLoginService {
  private static readonly API_BASE = API_URL;

  static async login(context: string, key: string): Promise<TotvsLoginResponse> {
    console.log('TotvsLoginService - Fazendo requisição para:', `${this.API_BASE}/auth/login-totvs`);
    console.log('TotvsLoginService - Context decodificado:', decodeURIComponent(context));
    console.log('TotvsLoginService - Key:', key);
    
    try {
      const response = await fetch(`${this.API_BASE}/auth/login-totvs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          context: decodeURIComponent(context), // Decodificar o context
          key: key 
        }),
      });

      console.log('TotvsLoginService - Response status:', response.status);
      console.log('TotvsLoginService - Response ok:', response.ok);

      if (!response.ok) {
        let errorMessage = 'Erro na autenticação TOTVS';
        try {
          const error = await response.json();
          console.log('TotvsLoginService - Error response:', error);
          errorMessage = error.message || errorMessage;
        } catch (parseError) {
          console.log('TotvsLoginService - Erro ao fazer parse da resposta de erro:', parseError);
          errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('TotvsLoginService - Success response:', result);
      return result;
    } catch (error) {
      console.error('TotvsLoginService - Erro na requisição:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro de rede ao conectar com o servidor');
    }
  }
}
