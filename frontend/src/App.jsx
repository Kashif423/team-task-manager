import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>
  return user ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}
// ```

// ---

// Once all files are saved, open **two terminals**:

// **Terminal 1** (backend):
// ```
// cd D:\TaskInternship\backend
// venv\Scripts\activate
// python manage.py runserver
// ```

// **Terminal 2** (frontend):
// ```
// cd D:\TaskInternship\frontend
// npm run dev
