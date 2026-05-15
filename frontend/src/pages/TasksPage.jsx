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
      <div className="rounded-lg border border-dark-800 bg-dark-900 p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 text-dark-400">
            <IoFunnelOutline size={18} />
            <span className="text-sm font-semibold uppercase text-primary-700">Task filters</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select value={statusFilter} onChange={e => { setLoading(true); setStatusFilter(e.target.value); }}
              className="rounded-lg border border-dark-800 bg-dark-950 px-3 py-2 text-sm text-dark-200 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/20">
              <option value="">All Status</option>
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <select value={priorityFilter} onChange={e => { setLoading(true); setPriorityFilter(e.target.value); }}
              className="rounded-lg border border-dark-800 bg-dark-950 px-3 py-2 text-sm text-dark-200 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/20">
              <option value="">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            {(statusFilter || priorityFilter) && (
              <button onClick={() => { setStatusFilter(''); setPriorityFilter(''); }} className="rounded-md px-2 py-1 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-50">Clear filters</button>
            )}
          </div>
        </div>
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
        <div className="overflow-hidden rounded-lg border border-dark-800 bg-dark-900 shadow-sm">
          {/* Table Header */}
          <div className="hidden gap-4 border-b border-dark-800 bg-dark-950 px-6 py-3 text-xs font-semibold uppercase text-dark-500 md:grid md:grid-cols-12">
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
              <div key={task._id} className={`grid grid-cols-1 items-center gap-2 px-6 py-4 transition-colors hover:bg-primary-50 md:grid-cols-12 md:gap-4 ${isOverdue(task.dueDate, task.status) ? 'border-l-4 border-l-red-500' : ''}`}>
                <div className="col-span-4 min-w-0">
                  <p className="font-medium text-dark-200 truncate">{task.title}</p>
                  {task.description && <p className="text-xs text-dark-500 truncate mt-0.5">{task.description}</p>}
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-dark-400">{task.project?.title || '-'}</span>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    {task.assignedTo ? (
                      <>
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary-100 text-[10px] font-bold text-primary-800">
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
                      className="w-full rounded-md border border-dark-800 bg-dark-950 px-2 py-1 text-xs text-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
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
