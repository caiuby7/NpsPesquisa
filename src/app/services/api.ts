import axios from 'axios'
import { parseCookies } from 'nookies'

export const api = axios.create({
  baseURL: 'http://paconlinesearch.us-east-1.elasticbeanstalk.com/api', // substitua pela sua URL da API
})

// Adiciona o token a cada requisição automaticamente
api.interceptors.request.use((config) => {
  const { token } = parseCookies()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
