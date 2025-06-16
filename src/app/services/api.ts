import axios from 'axios'
import Cookies from 'js-cookie'

export const api = axios.create({
  baseURL: 'http://paconlinesearch.us-east-1.elasticbeanstalk.com/api',
})

// Adiciona o token a cada requisição automaticamente
api.interceptors.request.use((config) => {
  const token = Cookies.get('token') || localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
