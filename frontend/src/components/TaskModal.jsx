import { useState, useEffect } from 'react'
import api from '../api'

export default function TaskModal({ task, teams, selectedTeam, onClose, onSave }) {
  const [form, setForm] = useState({
    title: '', description: '', team: selectedTeam || '', assigned_to: '', status: 'todo', due_date: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [members, setMembers] = useState([])

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description,
        team: task.team.id,
        assigned_to: task.assigned_to?.id || '',
        status: task.status,
        due_date: task.due_date || '',
      })
    }
  }, [task])

  useEffect(() => {
    const teamId = form.team
    if (teamId) {
      const team = teams.find(t => t.id === parseInt(teamId))
      setMembers(team?.members || [])
    }
  }, [form.team, teams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = { ...form, assigned_to: form.assigned_to || null, due_date: form.due_date || null }
      if (task) {
        await api.put(`/tasks/${task.id}/`, payload)
      } else {
        await api.post('/tasks/', payload)
      }
      onSave()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save task.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-screen overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-800 mb-4">{task ? 'Edit Task' : 'Create New Task'}</h2>
        {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="Task title" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="Optional description" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Team</label>
            <select value={form.team} onChange={e => setForm({...form, team: e.target.value})}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-500" required>
              <option value="">Select team</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Assign To</label>
            <select value={form.assigned_to} onChange={e => setForm({...form, assigned_to: e.target.value})}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-500">
              <option value="">Unassigned</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.username}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-500">
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
            <input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-slate-300 text-slate-700 py-2.5 rounded-lg hover:bg-slate-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-slate-800 text-white py-2.5 rounded-lg hover:bg-slate-700 transition disabled:opacity-50">
              {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}