import React, { useState, useMemo } from 'react';
import { useRequests } from '../../context/RequestContext';
import DataTable from '../../components/common/DataTable';
import DataFilterBar from '../../components/common/DataFilterBar';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import RequestDetailsModal from '../../components/forms/RequestDetailsModal';
import { formatDate, isOverdue24h } from '../../utils/formatters';
import { REQUEST_CATEGORIES, REQUEST_PRIORITY, REQUEST_STATUS } from '../../constants';
import { Eye, Clock, AlertTriangle } from 'lucide-react';

const AllRequests = () => {
  const { requests } = useRequests();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Filter requests
  const filteredRequests = useMemo(() => {
    const q = search.toLowerCase();
    return requests.filter((r) => {
      const matchSearch =
        (r.title || '').toLowerCase().includes(q) ||
        (r.id || '').toLowerCase().includes(q) ||
        (r.employeeName || '').toLowerCase().includes(q) ||
        (r.managerName || '').toLowerCase().includes(q);

      const matchStatus = selectedStatus === 'all' || r.status === selectedStatus;
      const matchCategory = selectedCategory === 'all' || r.category === selectedCategory;
      const matchPriority = selectedPriority === 'all' || r.priority === selectedPriority;

      return matchSearch && matchStatus && matchCategory && matchPriority;
    });
  }, [requests, search, selectedStatus, selectedCategory, selectedPriority]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedStatus('all');
    setSelectedCategory('all');
    setSelectedPriority('all');
  };

  const columns = [
    {
      header: 'Request Ref',
      accessor: 'id',
      cellClassName: 'text-xs font-mono font-bold text-slate-700',
    },
    {
      header: 'Title & Category',
      render: (r) => {
        const isOverdue = isOverdue24h(r.submittedAt, r.status);
        return (
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-900">{r.title}</span>
              {isOverdue && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  <AlertTriangle className="w-3 h-3 text-amber-600" /> &gt;24h Overdue
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 block">{r.category}</span>
          </div>
        );
      },
    },
    {
      header: 'Employee',
      render: (r) => (
        <div>
          <span className="text-xs font-semibold text-slate-800 block">{r.employeeName}</span>
          <span className="text-[10px] text-slate-400">{r.employeeDepartment}</span>
        </div>
      ),
    },
    {
      header: 'Assigned Manager',
      accessor: 'managerName',
      cellClassName: 'text-xs text-slate-700 font-medium',
    },
    {
      header: 'Priority',
      render: (r) => <PriorityBadge priority={r.priority} />,
    },
    {
      header: 'Status',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      header: 'Submitted',
      render: (r) => (
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {formatDate(r.submittedAt)}
        </span>
      ),
    },
    {
      header: 'Action',
      align: 'right',
      render: (r) => (
        <button
          onClick={() => setSelectedRequest(r)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Details</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Organization Requests</h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete register of all employee requests with real-time status and manager decision tracking.
        </p>
      </div>

      {/* Filter Bar */}
      <DataFilterBar
        search={search}
        onSearchChange={setSearch}
        status={selectedStatus}
        onStatusChange={setSelectedStatus}
        statusOptions={[
          { label: 'Pending Review', value: REQUEST_STATUS.PENDING },
          { label: 'Approved', value: REQUEST_STATUS.APPROVED },
          { label: 'Rejected', value: REQUEST_STATUS.REJECTED },
        ]}
        category={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categoryOptions={REQUEST_CATEGORIES}
        priority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        priorityOptions={Object.values(REQUEST_PRIORITY)}
        onReset={handleResetFilters}
      />

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredRequests}
        keyField="id"
        pageSize={6}
        emptyMessage="No requests found"
        emptySubtext="Try adjusting your status, category, or search filter parameters."
      />

      {/* Details Modal */}
      <RequestDetailsModal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        request={selectedRequest}
      />
    </div>
  );
};

export default AllRequests;

