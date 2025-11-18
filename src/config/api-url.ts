// ========================================
// CONFIGURAÇÃO DA URL DA API
// ========================================
// Este arquivo usa a configuração centralizada do environment.ts

import { ENVIRONMENT } from './environment';

export const API_URL = ENVIRONMENT.API_URL;

console.log("🚀 API_URL configurada:", API_URL);
