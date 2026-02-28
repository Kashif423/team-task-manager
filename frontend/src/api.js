import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

export default api
// ```

// Select ALL the text in the file (Ctrl+A) then paste this. Make sure there's no old code left. Save with Ctrl+S.

// Also make sure you installed simplejwt — run this in the backend terminal (stop server first):
// ```
// pip install djangorestframework-simplejwt
// ```

// Then restart:
// ```
// python manage.py runserver