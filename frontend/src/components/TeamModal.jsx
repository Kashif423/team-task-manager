import { useState } from 'react'
import api from '../api'

export default function TeamModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: '', description: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/teams/', form)
      onSave()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create team.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Create New Team</h2>
        {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Team Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="Enter team name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="Optional description"
              rows={3}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-slate-300 text-slate-700 py-2.5 rounded-lg hover:bg-slate-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-slate-800 text-white py-2.5 rounded-lg hover:bg-slate-700 transition disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}