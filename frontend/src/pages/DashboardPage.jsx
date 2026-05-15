import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import PriorityBadge from '../components/common/PriorityBadge';
import toast from 'react-hot-toast';
import {
  IoAlertCircleOutline,
  IoArrowForwardOutline,
  IoCalendarClearOutline,
  IoCheckboxOutline,
  IoCheckmarkCircleOutline,
  IoCopyOutline,
  IoFolderOutline,
  IoPeopleOutline,
  IoTimeOutline,
  IoTrendingUpOutline,
} from 'react-icons/io5';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Filler } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Filler);

const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
  <div className="group rounded-lg border border-dark-800 bg-dark-900 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lg hover:shadow-dark-50/10">
    <div className="flex items-center gap-4">
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${bgColor} transition-transform duration-300 group-hover:-rotate-3`}>
        <Icon size={24} className={color} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-dark-500">{label}</p>
        <p className="mt-1 text-3xl font-bold text-dark-50">{value}</p>
      </div>
    </div>
  </div>
);

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [focusFilter, setFocusFilter] = useState('all');
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

  const completionRate = stats.tasks.total
    ? Math.round((stats.tasks.completed / stats.tasks.total) * 100)
    : 0;
  const activeWork = stats.tasks.todo + stats.tasks.inProgress;
  const uniqueFocusItems = [
    ...stats.upcomingDeadlines.map(task => ({ ...task, source: 'deadline' })),
    ...stats.recentTasks.map(task => ({ ...task, source: 'recent' })),
  ].filter((task, index, list) => list.findIndex(item => item._id === task._id) === index);
  const focusItems = uniqueFocusItems.filter((task) => {
    if (focusFilter === 'deadlines') return task.source === 'deadline';
    if (focusFilter === 'active') return task.status !== 'completed';
    return true;
  }).slice(0, 6);
  const maxPriorityValue = Math.max(
    1,
    ...stats.taskPriorityDistribution.map(item => item.value)
  );

  const doughnutData = {
    labels: stats.taskStatusDistribution.map(d => d.name),
    datasets: [{
      data: stats.taskStatusDistribution.map(d => d.value),
      backgroundColor: ['#0f7f70', '#f59e0b', '#10b981'],
      borderColor: '#fbfcf8', borderWidth: 3, hoverOffset: 8,
    }],
  };

  const barData = {
    labels: stats.weeklyProgress.map(d => d.day),
    datasets: [{
      label: 'Completed', data: stats.weeklyProgress.map(d => d.completed),
      backgroundColor: 'rgba(22,160,133,0.22)', borderColor: '#0f7f70',
      borderWidth: 1, borderRadius: 6, borderSkipped: false,
    }],
  };

  const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
    scales: { x: { grid: { display: false }, ticks: { color: '#6f8077' }, border: { display: false } },
      y: { grid: { color: '#e4e9e1' }, ticks: { color: '#6f8077', stepSize: 1 }, border: { display: false } } } };

  const copyDailySummary = async () => {
    const summary = [
      `TaskPilot summary for ${user?.name || 'team'}`,
      `Projects: ${stats.projects.total} total, ${stats.projects.active} active`,
      `Tasks: ${stats.tasks.total} total, ${stats.tasks.completed} completed, ${stats.tasks.inProgress} in progress, ${stats.tasks.overdue} overdue`,
      `Completion rate: ${completionRate}%`,
      `Upcoming deadlines: ${stats.upcomingDeadlines.length}`,
    ].join('\n');

    if (!navigator.clipboard?.writeText) {
      toast.error('Clipboard is not available in this browser');
      return;
    }

    await navigator.clipboard.writeText(summary);
    toast.success('Dashboard summary copied');
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-lg border border-dark-800 bg-dark-900 p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-primary-700">Command center</p>
              <h2 className="mt-2 text-3xl font-bold text-dark-50">Good to see you, {user?.name}</h2>
              <p className="mt-2 max-w-2xl text-dark-500">
                TaskPilot has {activeWork} active tasks moving across {stats.projects.active} live projects.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={copyDailySummary}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-dark-800 bg-dark-950 px-4 py-2.5 text-sm font-medium text-dark-200 transition-colors hover:border-primary-200 hover:text-primary-700"
              >
                <IoCopyOutline size={17} /> Copy Summary
              </button>
              <Link
                to="/tasks"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-600"
              >
                Open Tasks <IoArrowForwardOutline size={17} />
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-primary-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-primary-700">Completion</p>
                <IoTrendingUpOutline className="text-primary-700" size={18} />
              </div>
              <p className="mt-2 text-4xl font-bold text-primary-900">{completionRate}%</p>
              <div className="mt-3 h-2 rounded-full bg-primary-100">
                <div
                  className="h-full rounded-full bg-primary-700"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>
            <div className="rounded-lg bg-orange-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-orange-700">Due soon</p>
                <IoCalendarClearOutline className="text-orange-700" size={18} />
              </div>
              <p className="mt-2 text-4xl font-bold text-orange-900">{stats.upcomingDeadlines.length}</p>
              <p className="mt-1 text-sm text-orange-800">next visible deadlines</p>
            </div>
            <div className="rounded-lg bg-rose-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-rose-700">Overdue</p>
                <IoAlertCircleOutline className="text-rose-700" size={18} />
              </div>
              <p className="mt-2 text-4xl font-bold text-rose-900">{stats.tasks.overdue}</p>
              <p className="mt-1 text-sm text-rose-800">needs attention</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-dark-800 bg-dark-50 p-6 text-white shadow-sm">
          <p className="text-sm font-semibold uppercase text-primary-200">Workload mix</p>
          <div className="mt-5 space-y-4">
            {stats.taskPriorityDistribution.map(item => (
              <div key={item.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{item.name}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
                <div className="h-2 rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-primary-300"
                    style={{ width: `${(item.value / maxPriorityValue) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-lg border border-white/10 bg-white/10 p-4">
            <p className="text-sm text-white/70">Team members</p>
            <p className="mt-1 text-3xl font-bold">{stats.totalMembers}</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={IoFolderOutline} label="Projects" value={stats.projects.total} color="text-sky-700" bgColor="bg-sky-100" />
        <StatCard icon={IoCheckboxOutline} label="Tasks" value={stats.tasks.total} color="text-primary-700" bgColor="bg-primary-100" />
        <StatCard icon={IoCheckmarkCircleOutline} label="Completed" value={stats.tasks.completed} color="text-emerald-700" bgColor="bg-emerald-100" />
        <StatCard icon={IoTimeOutline} label="In Progress" value={stats.tasks.inProgress} color="text-amber-700" bgColor="bg-amber-100" />
        <StatCard icon={IoAlertCircleOutline} label="Overdue" value={stats.tasks.overdue} color="text-rose-700" bgColor="bg-rose-100" />
        <StatCard icon={IoPeopleOutline} label="Members" value={stats.totalMembers} color="text-violet-700" bgColor="bg-violet-100" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-lg border border-dark-800 bg-dark-900 p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-dark-100">Focus Queue</h3>
              <p className="text-sm text-dark-500">Filter the work that should be noticed first.</p>
            </div>
            <div className="flex rounded-lg border border-dark-800 bg-dark-950 p-1">
              {[
                ['all', 'All'],
                ['active', 'Active'],
                ['deadlines', 'Deadlines'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFocusFilter(value)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    focusFilter === value
                      ? 'bg-primary-700 text-white'
                      : 'text-dark-500 hover:text-dark-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {focusItems.length > 0 ? focusItems.map(task => (
              <div key={`${task._id}-${task.source}`} className="grid gap-3 rounded-lg bg-dark-950 p-4 transition-colors hover:bg-primary-50 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="min-w-0">
                  <p className="truncate font-medium text-dark-100">{task.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-dark-500">
                    <span>{task.project?.title || 'No project'}</span>
                    <span>/</span>
                    <span>{task.source === 'deadline' ? 'deadline watch' : 'recent activity'}</span>
                    {task.dueDate && (
                      <>
                        <span>/</span>
                        <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                </div>
              </div>
            )) : <p className="py-8 text-center text-sm text-dark-500">No focus items for this filter</p>}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-lg border border-dark-800 bg-dark-900 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-dark-100 mb-4">Task Status</h3>
          <div className="h-[280px] flex items-center justify-center">
            {stats.tasks.total > 0 ? <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { color: '#6f8077', padding: 16, usePointStyle: true } } } }} /> : <p className="text-dark-500 text-sm">No tasks yet</p>}
          </div>
        </div>
        <div className="rounded-lg border border-dark-800 bg-dark-900 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-dark-100 mb-4">Weekly Progress</h3>
            <div className="h-[220px]"><Bar data={barData} options={chartOpts} /></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
