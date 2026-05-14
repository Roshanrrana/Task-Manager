const PriorityBadge = ({ priority }) => {
  const styles = {
    high: 'bg-red-500/20 text-red-300 border border-red-500/30',
    medium: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    low: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  };

  const icons = {
    high: '↑↑',
    medium: '→',
    low: '↓',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
        styles[priority] || 'bg-dark-700 text-dark-300'
      }`}
    >
      <span>{icons[priority]}</span>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

export default PriorityBadge;
