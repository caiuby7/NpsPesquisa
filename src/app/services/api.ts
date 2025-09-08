import axios from 'axios'
import Cookies from 'js-cookie'
import { API_CONFIG } from '../../config/api.config'

export const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
})

// Adiciona o token a cada requisição automaticamente
api.interceptors.request.use((config) => {
  const token = Cookies.get('token') || localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
