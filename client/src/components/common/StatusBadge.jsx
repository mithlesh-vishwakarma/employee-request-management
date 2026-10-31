import React from 'react';
import { getStatusBadgeStyle } from '../../utils/formatters';

const StatusBadge = ({ status, className = '' }) => {
  const style = getStatusBadgeStyle(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${style.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
};

export default StatusBadge;

