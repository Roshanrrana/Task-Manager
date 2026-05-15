import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/useAuth';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { IoAddOutline, IoTrashOutline, IoArrowBackOutline, IoPersonAddOutline } from 'react-icons/io5';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '', status: 'todo' });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        API.get(`/projects/${id}`),
        API.get(`/tasks?project=${id}`),
      ]);
      setProject(projRes.data);
      setTasks(taskRes.data);
      if (isAdmin) {
        const usersRes = await API.get('/users');
        setAllUsers(usersRes.data);
      }
    } catch { toast.error('Failed to load project'); navigate('/projects'); }
    finally { setLoading(false); }
  }, [id, isAdmin, navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title || !taskForm.dueDate) { toast.error('Title and due date required'); return; }
    setSubmitting(true);
    try {
      await API.post('/tasks', { ...taskForm, project: id });
      toast.success('Task created');
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '', status: 'todo' });
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try { await API.delete(`/tasks/${taskId}`); toast.success('Task deleted'); fetchData(); }
    catch { toast.error('Failed'); }
  };

  const handleStatusChange = async (taskId, status) => {
    try { await API.put(`/tasks/${taskId}`, { status }); fetchData(); }
    catch { toast.error('Failed to update'); }
  };

  const handleAddMember = async (userId) => {
    const memberIds = [...(project.members?.map(m => m._id) || []), userId];
    try { await API.put(`/projects/${id}/members`, { members: memberIds }); toast.success('Member added'); fetchData(); }
    catch { toast.error('Failed'); }
  };

  const handleRemoveMember = async (userId) => {
    const memberIds = project.members?.filter(m => m._id !== userId).map(m => m._id) || [];
    try { await API.put(`/projects/${id}/members`, { members: memberIds }); toast.success('Member removed'); fetchData(); }
    catch { toast.error('Failed'); }
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-[50vh]" />;
  if (!project) return null;

  const nonMembers = allUsers.filter(u => !project.members?.some(m => m._id === u._id));

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/projects')} className="flex items-center gap-2 rounded-lg border border-dark-800 bg-dark-900 px-3 py-2 text-sm text-dark-400 shadow-sm transition-colors hover:border-primary-200 hover:text-primary-700">
        <IoArrowBackOutline size={16} /> Back to Projects
      </button>

      {/* Project Header */}
      <div className="rounded-lg border border-dark-800 bg-dark-900 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-dark-50">{project.title}</h2>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-dark-400">{project.description || 'No description'}</p>
            <p className="text-dark-500 text-sm mt-2">Deadline: {new Date(project.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <button onClick={() => setShowMemberModal(true)} className="flex items-center gap-1.5 rounded-lg border border-dark-800 bg-dark-950 px-3 py-2 text-sm text-dark-300 transition-colors hover:border-primary-200 hover:text-primary-700">
                <IoPersonAddOutline size={16} /> Members
              </button>
              <button onClick={() => setShowTaskModal(true)} className="flex items-center gap-1.5 rounded-lg bg-primary-700 px-3 py-2 text-sm text-white shadow-sm transition-colors hover:bg-primary-600">
                <IoAddOutline size={16} /> Add Task
              </button>
            </div>
          )}
        </div>

        {/* Members */}
        <div className="mt-4 pt-4 border-t border-dark-800">
          <p className="text-sm text-dark-500 mb-2">Team Members ({project.members?.length || 0})</p>
          <div className="flex flex-wrap gap-2">
            {project.members?.map(m => (
              <div key={m._id} className="flex items-center gap-2 rounded-lg bg-dark-950 px-3 py-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-100 text-[10px] font-bold text-primary-800">
                  {m.name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="text-sm text-dark-300">{m.name}</span>
                <span className="text-[10px] text-dark-500 capitalize">({m.role})</span>
                {isAdmin && (
                  <button onClick={() => handleRemoveMember(m._id)} className="ml-1 text-dark-600 transition-colors hover:text-red-600">x</button>
                )}
              </div>
            ))}
            {(!project.members || project.members.length === 0) && <p className="text-dark-600 text-sm">No members added</p>}
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="rounded-lg border border-dark-800 bg-dark-900 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-dark-100 mb-4">Tasks ({tasks.length})</h3>
        {tasks.length === 0 ? (
          <p className="text-dark-500 text-center py-8">No tasks yet</p>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => (
              <div key={task._id} className="flex flex-col justify-between gap-3 rounded-lg bg-dark-950 p-4 transition-colors hover:bg-primary-50 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-dark-200">{task.title}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs text-dark-500">Assigned: {task.assignedTo?.name || 'Unassigned'}</span>
                    <span className="text-xs text-dark-600">/</span>
                    <span className="text-xs text-dark-500">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <PriorityBadge priority={task.priority} />
                  <select value={task.status} onChange={e => handleStatusChange(task._id, e.target.value)}
                    className="rounded-md border border-dark-800 bg-dark-900 px-2 py-1 text-xs text-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                    <option value="todo">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  {isAdmin && (
                    <button onClick={() => handleDeleteTask(task._id)} className="rounded-md p-1.5 text-dark-500 transition-colors hover:bg-red-50 hover:text-red-600">
                      <IoTrashOutline size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Create Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Title</label>
            <input value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="Task title"
              className="w-full rounded-lg border border-dark-800 bg-dark-950 px-4 py-2.5 text-dark-100 placeholder-dark-600 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Description</label>
            <textarea value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} rows={2}
              className="w-full resize-none rounded-lg border border-dark-800 bg-dark-950 px-4 py-2.5 text-dark-100 placeholder-dark-600 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Assign To</label>
              <select value={taskForm.assignedTo} onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                className="w-full rounded-lg border border-dark-800 bg-dark-950 px-4 py-2.5 text-dark-100 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                <option value="">Unassigned</option>
                {project.members?.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Priority</label>
              <select value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="w-full rounded-lg border border-dark-800 bg-dark-950 px-4 py-2.5 text-dark-100 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Due Date</label>
            <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              className="w-full rounded-lg border border-dark-800 bg-dark-950 px-4 py-2.5 text-dark-100 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full rounded-lg bg-primary-700 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-primary-600 disabled:opacity-50">
            {submitting ? 'Creating...' : 'Create Task'}
          </button>
        </form>
      </Modal>

      {/* Members Modal */}
      <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Manage Members">
        <div className="space-y-4">
          {nonMembers.length > 0 && (
            <div>
              <p className="text-sm font-medium text-dark-300 mb-2">Add Members</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {nonMembers.map(u => (
                  <div key={u._id} className="flex items-center justify-between rounded-lg bg-dark-950 p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-100 text-xs font-bold text-primary-800">
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm text-dark-200">{u.name}</p>
                        <p className="text-xs text-dark-500">{u.email}</p>
                      </div>
                    </div>
                    <button onClick={() => handleAddMember(u._id)} className="rounded-md bg-primary-700 px-3 py-1 text-xs text-white transition-colors hover:bg-primary-600">Add</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-dark-300 mb-2">Current Members ({project.members?.length || 0})</p>
            <div className="space-y-2">
              {project.members?.map(m => (
                <div key={m._id} className="flex items-center justify-between rounded-lg bg-dark-950 p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-100 text-xs font-bold text-emerald-800">
                      {m.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-dark-200">{m.name}</p>
                      <p className="text-xs text-dark-500 capitalize">{m.role}</p>
                    </div>
                  </div>
                  <button onClick={() => handleRemoveMember(m._id)} className="rounded-md bg-red-50 px-3 py-1 text-xs text-red-600 transition-colors hover:bg-red-100">Remove</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetailPage;
