import { useCallback, useEffect, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/useAuth';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { IoFunnelOutline } from 'react-icons/io5';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const { user } = useAuth();

  const fetchTasks = useCallback(async () => {
    try {
      let url = '/tasks?';
      if (statusFilter) url += `status=${statusFilter}&`;
      if (priorityFilter) url += `priority=${priorityFilter}&`;
      const { data } = await API.get(url);
      setTasks(data);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  }, [priorityFilter, statusFilter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleStatusChange = async (taskId, status) => {
    try {
      await API.put(`/tasks/${taskId}`, { status });
      toast.success('Status updated');
      fetchTasks();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-[50vh]" />;

  const isOverdue = (dueDate, status) => status !== 'completed' && new Date(dueDate) < new Date();

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-dark-400">
          <IoFunnelOutline size={18} />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        <select value={statusFilter} onChange={e => { setLoading(true); setStatusFilter(e.target.value); }}
          className="px-3 py-2 bg-dark-900 border border-dark-800 rounded-xl text-sm text-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all">
          <option value="">All Status</option>
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select value={priorityFilter} onChange={e => { setLoading(true); setPriorityFilter(e.target.value); }}
          className="px-3 py-2 bg-dark-900 border border-dark-800 rounded-xl text-sm text-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all">
          <option value="">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        {(statusFilter || priorityFilter) && (
          <button onClick={() => { setStatusFilter(''); setPriorityFilter(''); }} className="text-xs text-primary-400 hover:text-primary-300">Clear filters</button>
        )}
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-dark-500 text-lg">No tasks found</p>
          <p className="text-dark-600 text-sm mt-1">
            {statusFilter || priorityFilter ? 'Try changing your filters' : 'Tasks will appear here when created'}
          </p>
        </div>
      ) : (
        <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-dark-800/50 text-xs font-medium text-dark-500 uppercase tracking-wider">
            <div className="col-span-4">Task</div>
            <div className="col-span-2">Project</div>
            <div className="col-span-2">Assigned To</div>
            <div className="col-span-1">Priority</div>
            <div className="col-span-1">Due Date</div>
            <div className="col-span-2">Status</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-dark-800">
            {tasks.map(task => (
              <div key={task._id} className={`grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 hover:bg-dark-800/30 transition-colors items-center ${isOverdue(task.dueDate, task.status) ? 'border-l-2 border-l-red-500' : ''}`}>
                <div className="col-span-4 min-w-0">
                  <p className="font-medium text-dark-200 truncate">{task.title}</p>
                  {task.description && <p className="text-xs text-dark-500 truncate mt-0.5">{task.description}</p>}
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-dark-400">{task.project?.title || '—'}</span>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    {task.assignedTo ? (
                      <>
                        <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                          {task.assignedTo.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="text-sm text-dark-300 truncate">{task.assignedTo.name}</span>
                      </>
                    ) : <span className="text-sm text-dark-600">Unassigned</span>}
                  </div>
                </div>
                <div className="col-span-1">
                  <PriorityBadge priority={task.priority} />
                </div>
                <div className="col-span-1">
                  <span className={`text-xs ${isOverdue(task.dueDate, task.status) ? 'text-red-400 font-medium' : 'text-dark-400'}`}>
                    {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="col-span-2">
                  {(user?.role === 'admin' || task.assignedTo?._id === user?._id) ? (
                    <select value={task.status} onChange={e => handleStatusChange(task._id, e.target.value)}
                      className="px-2 py-1 bg-dark-800 border border-dark-700 rounded-lg text-xs text-dark-200 focus:outline-none focus:ring-1 focus:ring-primary-500 w-full">
                      <option value="todo">Todo</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  ) : <StatusBadge status={task.status} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
