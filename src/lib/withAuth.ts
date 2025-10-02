// utils/withAuth.ts
import { jwtDecode } from "jwt-decode";

export function isTokenValid(token: string): boolean {
  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    const now = Date.now() / 1000; // em segundos
    return decoded.exp > now;
  } catch {
    return false;
  }
}

// Hook para verificar autenticação no React
export function useAuth() {
  const token = localStorage.getItem("token");
  
  if (!token || !isTokenValid(token)) {
    // Redirecionar para login
    window.location.href = "/login";
    return false;
  }
  
  return true;
}
