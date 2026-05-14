import { useCallback, useEffect, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import { IoFolderOutline, IoCheckboxOutline, IoCheckmarkCircleOutline, IoTimeOutline, IoAlertCircleOutline, IoPeopleOutline } from 'react-icons/io5';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Filler } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Filler);

const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
  <div className="bg-dark-900 border border-dark-800 rounded-2xl p-5 hover:border-dark-700 transition-all duration-300 group hover:shadow-lg">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-dark-400 text-sm font-medium">{label}</p>
        <p className="text-3xl font-bold text-dark-50 mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
        <Icon size={24} className={color} />
      </div>
    </div>
  </div>
);

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await API.get('/dashboard/stats');
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) return <LoadingSpinner size="lg" className="min-h-[50vh]" />;
  if (!stats) return <div className="text-center text-dark-400 py-20">Failed to load dashboard</div>;

  const doughnutData = {
    labels: stats.taskStatusDistribution.map(d => d.name),
    datasets: [{
      data: stats.taskStatusDistribution.map(d => d.value),
      backgroundColor: ['#6366f1', '#f59e0b', '#10b981'],
      borderColor: '#0f172a', borderWidth: 3, hoverOffset: 8,
    }],
  };

  const barData = {
    labels: stats.weeklyProgress.map(d => d.day),
    datasets: [{
      label: 'Completed', data: stats.weeklyProgress.map(d => d.completed),
      backgroundColor: 'rgba(99,102,241,0.5)', borderColor: '#6366f1',
      borderWidth: 1, borderRadius: 6, borderSkipped: false,
    }],
  };

  const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
    scales: { x: { grid: { display: false }, ticks: { color: '#64748b' }, border: { display: false } },
      y: { grid: { color: '#1e293b' }, ticks: { color: '#64748b', stepSize: 1 }, border: { display: false } } } };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-600/20 to-primary-400/10 border border-primary-500/20 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-dark-50">Welcome back, {user?.name} 👋</h2>
        <p className="text-dark-400 mt-1">Here's what's happening with your projects today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={IoFolderOutline} label="Projects" value={stats.projects.total} color="text-blue-400" bgColor="bg-blue-500/15" />
        <StatCard icon={IoCheckboxOutline} label="Tasks" value={stats.tasks.total} color="text-primary-400" bgColor="bg-primary-500/15" />
        <StatCard icon={IoCheckmarkCircleOutline} label="Completed" value={stats.tasks.completed} color="text-emerald-400" bgColor="bg-emerald-500/15" />
        <StatCard icon={IoTimeOutline} label="In Progress" value={stats.tasks.inProgress} color="text-amber-400" bgColor="bg-amber-500/15" />
        <StatCard icon={IoAlertCircleOutline} label="Overdue" value={stats.tasks.overdue} color="text-red-400" bgColor="bg-red-500/15" />
        <StatCard icon={IoPeopleOutline} label="Members" value={stats.totalMembers} color="text-purple-400" bgColor="bg-purple-500/15" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-dark-100 mb-4">Task Status</h3>
          <div className="h-[280px] flex items-center justify-center">
            {stats.tasks.total > 0 ? <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 16, usePointStyle: true } } } }} /> : <p className="text-dark-500 text-sm">No tasks yet</p>}
          </div>
        </div>
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-dark-100 mb-4">Weekly Progress</h3>
          <div className="h-[280px]"><Bar data={barData} options={chartOpts} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-dark-100 mb-4">Recent Tasks</h3>
          <div className="space-y-3">
            {stats.recentTasks.length > 0 ? stats.recentTasks.map(task => (
              <div key={task._id} className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl hover:bg-dark-800 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-dark-200 truncate">{task.title}</p>
                  <p className="text-xs text-dark-500 mt-0.5">{task.project?.title}</p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                </div>
              </div>
            )) : <p className="text-dark-500 text-sm text-center py-4">No tasks yet</p>}
          </div>
        </div>
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-dark-100 mb-4">Upcoming Deadlines</h3>
          <div className="space-y-3">
            {stats.upcomingDeadlines.length > 0 ? stats.upcomingDeadlines.map(task => (
              <div key={task._id} className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl hover:bg-dark-800 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-dark-200 truncate">{task.title}</p>
                  <p className="text-xs text-dark-500 mt-0.5">{task.project?.title}</p>
                </div>
                <span className="text-xs text-dark-400 ml-3">{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            )) : <p className="text-dark-500 text-sm text-center py-4">No upcoming deadlines</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
