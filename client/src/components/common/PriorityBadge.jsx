import React from 'react';
import { getPriorityBadgeStyle } from '../../utils/formatters';

const PriorityBadge = ({ priority, className = '' }) => {
  const style = getPriorityBadgeStyle(priority);

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${style.bg} ${className}`}
    >
      {style.label}
    </span>
  );
};

export default PriorityBadge;
