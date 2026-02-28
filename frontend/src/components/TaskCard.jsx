export default function TaskCard({ task, onEdit, onDelete }) {
  const statusColors = {
    todo: 'bg-slate-100 text-slate-600',
    in_progress: 'bg-blue-100 text-blue-600',
    done: 'bg-green-100 text-green-600',
  }
  const statusLabels = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' }

  return (
    <div className="bg-white rounded-xl shadow p-4 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-slate-800 text-sm leading-tight flex-1 mr-2">{task.title}</h3>
        <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${statusColors[task.status]}`}>
          {statusLabels[task.status]}
        </span>
      </div>
      {task.description && <p className="text-slate-500 text-xs mb-3 line-clamp-2">{task.description}</p>}
      <div className="text-xs text-slate-400 space-y-1 mb-3">
        {task.assigned_to && <div>👤 {task.assigned_to.username}</div>}
        {task.due_date && <div>📅 {task.due_date}</div>}
        <div>🏷 {task.team.name}</div>
      </div>
      <div className="flex gap-2 pt-2 border-t border-slate-100">
        <button onClick={() => onEdit(task)} className="flex-1 text-xs text-slate-600 hover:text-slate-800 py-1 hover:bg-slate-50 rounded transition">
          Edit
        </button>
        <button onClick={() => onDelete(task.id)} className="flex-1 text-xs text-red-500 hover:text-red-700 py-1 hover:bg-red-50 rounded transition">
          Delete
        </button>
      </div>
    </div>
  )
}