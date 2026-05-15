const PriorityBadge = ({ priority }) => {
  const styles = {
    high: 'bg-rose-100 text-rose-800 border border-rose-200',
    medium: 'bg-orange-100 text-orange-800 border border-orange-200',
    low: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  };

  const icons = {
    high: '!',
    medium: '=',
    low: 'v',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold ${
        styles[priority] || 'bg-dark-800 text-dark-300'
      }`}
    >
      <span className="font-bold">{icons[priority]}</span>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

export default PriorityBadge;
