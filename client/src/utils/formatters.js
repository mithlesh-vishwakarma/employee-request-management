export const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`;
  }
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  return diffInDays === 1 ? 'Yesterday' : `${diffInDays}d ago`;
};

export const isOverdue24h = (submittedAt, status) => {
  if (status !== 'pending' || !submittedAt) return false;
  const submittedTime = new Date(submittedAt).getTime();
  const now = Date.now();
  return (now - submittedTime) > (24 * 60 * 60 * 1000);
};

export const getStatusBadgeStyle = (status) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Approved',
      };
    case 'rejected':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
        label: 'Rejected',
      };
    case 'pending':
    default:
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        label: 'Pending Review',
      };
  }
};

export const getPriorityBadgeStyle = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'high':
      return {
        bg: 'bg-rose-100 text-rose-800',
        label: 'High Priority',
      };
    case 'medium':
      return {
        bg: 'bg-blue-100 text-blue-800',
        label: 'Medium',
      };
    case 'low':
    default:
      return {
        bg: 'bg-slate-100 text-slate-700',
        label: 'Low',
      };
  }
};

