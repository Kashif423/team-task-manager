import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import TeamModal from '../components/TeamModal'
import TaskModal from '../components/TaskModal'
import TaskCard from '../components/TaskCard'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [teams, setTeams] = useState([])
  const [tasks, setTasks] = useState([])
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState('')

  useEffect(() => { fetchTeams() }, [])
  useEffect(() => { fetchTasks() }, [selectedTeam, search, statusFilter, assigneeFilter])

  const fetchTeams = async () => {
    try {
      const res = await api.get('/teams/')
      setTeams(res.data)
      if (res.data.length > 0 && !selectedTeam) setSelectedTeam(res.data[0].id)
    } catch {}
  }

  const fetchTasks = async () => {
    try {
      const params = {}
      if (selectedTeam) params.team = selectedTeam
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      if (assigneeFilter) params.assignee = assigneeFilter
      const res = await api.get('/tasks/', { params })
      setTasks(res.data)
    } catch {}
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleDeleteTask = async (id) => {
    await api.delete(`/tasks/${id}/`)
    fetchTasks()
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setShowTaskModal(true)
  }

  const currentTeam = teams.find(t => t.id === selectedTeam)
  const members = currentTeam?.members || []

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-slate-800 text-white px-6 py-4 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">TaskManager</h1>
        <div className="flex items-center gap-4">
          <span className="text-slate-300 text-sm">Hi, {user?.username}</span>
          <button onClick={handleLogout} className="bg-slate-600 hover:bg-slate-500 px-4 py-1.5 rounded-lg text-sm transition">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-6">

          {/* Sidebar - Teams */}
          <div className="w-64 shrink-0">
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-slate-700">My Teams</h2>
                <button onClick={() => setShowTeamModal(true)} className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-slate-700">
                  + New
                </button>
              </div>
              {teams.length === 0 && <p className="text-slate-400 text-sm">No teams yet.</p>}
              {teams.map(team => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm mb-1 transition ${selectedTeam === team.id ? 'bg-slate-800 text-white' : 'hover:bg-slate-100 text-slate-700'}`}
                >
                  <div className="font-medium">{team.name}</div>
                  <div className={`text-xs mt-0.5 ${selectedTeam === team.id ? 'text-slate-300' : 'text-slate-400'}`}>
                    {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow p-4 mb-4 flex flex-wrap gap-3 items-center">
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 flex-1 min-w-40"
              />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="">All Status</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <select
                value={assigneeFilter}
                onChange={e => setAssigneeFilter(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="">All Members</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.username}</option>)}
              </select>
              <button
                onClick={() => { setEditingTask(null); setShowTaskModal(true) }}
                className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700 transition"
              >
                + New Task
              </button>
            </div>

            {/* Tasks Grid */}
            {!selectedTeam ? (
              <div className="text-center py-20 text-slate-400">Create a team to get started</div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-20 text-slate-400">No tasks found. Create one!</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showTeamModal && (
        <TeamModal onClose={() => setShowTeamModal(false)} onSave={() => { fetchTeams(); setShowTeamModal(false) }} />
      )}
      {showTaskModal && (
        <TaskModal
          task={editingTask}
          teams={teams}
          selectedTeam={selectedTeam}
          onClose={() => { setShowTaskModal(false); setEditingTask(null) }}
          onSave={() => { fetchTasks(); setShowTaskModal(false); setEditingTask(null) }}
        />
      )}
    </div>
  )
}