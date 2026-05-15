const StatusBadge = ({ status }) => {
  const styles = {
    todo: 'bg-slate-100 text-slate-700 border border-slate-200',
    'in-progress': 'bg-amber-100 text-amber-800 border border-amber-200',
    completed: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    active: 'bg-primary-50 text-primary-800 border border-primary-200',
  };

  const labels = {
    todo: 'Todo',
    'in-progress': 'In Progress',
    completed: 'Completed',
    active: 'Active',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${
        styles[status] || 'bg-dark-800 text-dark-300'
      }`}
    >
      {labels[status] || status}
    </span>
  );
};

export default StatusBadge;
