import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://paconlinesearch.us-east-1.elasticbeanstalk.com/api',
})

// Adiciona o token a cada requisição automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
