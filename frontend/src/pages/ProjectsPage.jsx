import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/useAuth';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { IoAddOutline, IoTrashOutline, IoPencilOutline, IoSearchOutline } from 'react-icons/io5';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ title: '', description: '', deadline: '', status: 'active' });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const fetchProjects = useCallback(async () => {
    try {
      const { data } = await API.get('/projects');
      setProjects(data);
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.deadline) { toast.error('Title and deadline are required'); return; }
    setSubmitting(true);
    try {
      if (editProject) {
        await API.put(`/projects/${editProject._id}`, form);
        toast.success('Project updated');
      } else {
        await API.post('/projects', form);
        toast.success('Project created');
      }
      setShowModal(false); setEditProject(null);
      setForm({ title: '', description: '', deadline: '', status: 'active' });
      fetchProjects();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await API.delete(`/projects/${id}`);
      toast.success('Project deleted');
      fetchProjects();
    } catch { toast.error('Failed to delete'); }
  };

  const openEdit = (p) => {
    setEditProject(p);
    setForm({ title: p.title, description: p.description, deadline: p.deadline?.split('T')[0], status: p.status });
    setShowModal(true);
  };

  const openCreate = () => {
    setEditProject(null);
    setForm({ title: '', description: '', deadline: '', status: 'active' });
    setShowModal(true);
  };

  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner size="lg" className="min-h-[50vh]" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2.5 bg-dark-900 border border-dark-800 rounded-xl text-dark-100 placeholder-dark-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all" />
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-medium rounded-xl shadow-lg shadow-primary-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
            <IoAddOutline size={20} /> New Project
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-dark-500 text-lg">No projects found</p>
          {isAdmin && <p className="text-dark-600 text-sm mt-1">Create your first project to get started</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(project => (
            <Link key={project._id} to={`/projects/${project._id}`}
              className="bg-dark-900 border border-dark-800 rounded-2xl p-5 hover:border-dark-700 hover:shadow-lg hover:shadow-black/20 transition-all duration-300 group block">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-dark-100 group-hover:text-primary-300 transition-colors truncate flex-1">{project.title}</h3>
                <StatusBadge status={project.status} />
              </div>
              <p className="text-dark-400 text-sm line-clamp-2 mb-4">{project.description || 'No description'}</p>
              <div className="flex items-center justify-between text-xs text-dark-500">
                <div className="flex items-center gap-1">
                  <div className="flex -space-x-2">
                    {project.members?.slice(0, 3).map((m, i) => (
                      <div key={m._id || i} className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center border-2 border-dark-900 text-[10px] font-bold text-white">
                        {m.name?.charAt(0)?.toUpperCase()}
                      </div>
                    ))}
                    {project.members?.length > 3 && <span className="ml-1">+{project.members.length - 3}</span>}
                  </div>
                </div>
                <span>Due {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              {isAdmin && (
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-dark-800">
                  <button onClick={(e) => { e.preventDefault(); openEdit(project); }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-dark-400 hover:text-primary-300 hover:bg-dark-800 rounded-lg transition-colors">
                    <IoPencilOutline size={14} /> Edit
                  </button>
                  <button onClick={(e) => { e.preventDefault(); handleDelete(project._id); }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-dark-400 hover:text-red-400 hover:bg-dark-800 rounded-lg transition-colors">
                    <IoTrashOutline size={14} /> Delete
                  </button>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editProject ? 'Edit Project' : 'New Project'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Title</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Project title"
              className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-dark-100 placeholder-dark-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Project description..."
              className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-dark-100 placeholder-dark-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Deadline</label>
              <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })}
                className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-dark-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-dark-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all">
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-medium rounded-xl shadow-lg shadow-primary-500/25 transition-all disabled:opacity-50">
            {submitting ? 'Saving...' : editProject ? 'Update Project' : 'Create Project'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectsPage;
