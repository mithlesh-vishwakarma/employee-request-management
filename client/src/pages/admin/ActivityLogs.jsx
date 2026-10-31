import React, { useState, useMemo } from 'react';
import { useRequests } from '../../context/RequestContext';
import DataTable from '../../components/common/DataTable';
import { formatDateTime } from '../../utils/formatters';
import { Activity, Search, Shield, Filter } from 'lucide-react';

const ActivityLogs = () => {
  const { activityLogs } = useRequests();

  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');

  const filteredLogs = useMemo(() => {
    const q = search.toLowerCase();
    return activityLogs.filter((log) => {
      const matchSearch =
        (log.actorName || '').toLowerCase().includes(q) ||
        (log.description || '').toLowerCase().includes(q) ||
        (log.entityId && String(log.entityId).toLowerCase().includes(q));

      const matchAction = selectedAction === 'all' || log.action === selectedAction;
      return matchSearch && matchAction;
    });
  }, [activityLogs, search, selectedAction]);

  const getActionBadge = (action) => {
    if (action.includes('APPROVED')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          {action}
        </span>
      );
    }
    if (action.includes('REJECTED')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          {action}
        </span>
      );
    }
    if (action.includes('REMINDER')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          {action}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
        {action}
      </span>
    );
  };

  const columns = [
    {
      header: 'Timestamp',
      render: (log) => (
        <span className="text-xs font-mono text-slate-500 whitespace-nowrap">
          {formatDateTime(log.createdAt)}
        </span>
      ),
    },
    {
      header: 'Actor',
      render: (log) => (
        <div>
          <span className="text-xs font-bold text-slate-900 block">{log.actorName}</span>
          <span className="text-[10px] uppercase font-semibold text-slate-400">{log.actorRole}</span>
        </div>
      ),
    },
    {
      header: 'Action',
      render: (log) => getActionBadge(log.action),
    },
    {
      header: 'Target Entity',
      render: (log) => (
        <span className="text-xs font-medium text-slate-700">
          {log.entityType} {log.entityId ? `(#${log.entityId})` : ''}
        </span>
      ),
    },
    {
      header: 'Description & Metadata',
      accessor: 'description',
      cellClassName: 'text-xs text-slate-600',
    },
  ];

  const uniqueActions = Array.from(new Set(activityLogs.map((l) => l.action)));

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Activity Logs</h1>
        <p className="text-xs text-slate-500 mt-1">
          Immutable corporate audit trail recording authentication, status transitions, and administrative assignments.
        </p>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity records by actor, description, or reference ID..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Action Events</option>
            {uniqueActions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredLogs}
        keyField="id"
        pageSize={8}
        emptyMessage="No activity logs found"
        emptySubtext="Try altering your search or action filter."
      />
    </div>
  );
};

export default ActivityLogs;

