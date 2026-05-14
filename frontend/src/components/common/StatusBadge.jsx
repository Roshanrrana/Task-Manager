const StatusBadge = ({ status }) => {
  const styles = {
    todo: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    'in-progress': 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    completed: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    active: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  };

  const labels = {
    todo: 'Todo',
    'in-progress': 'In Progress',
    completed: 'Completed',
    active: 'Active',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        styles[status] || 'bg-dark-700 text-dark-300'
      }`}
    >
      {labels[status] || status}
    </span>
  );
};

export default StatusBadge;
