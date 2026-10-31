import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestContext';
import DataTable from '../../components/common/DataTable';
import DataFilterBar from '../../components/common/DataFilterBar';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import ReviewRequestModal from '../../components/forms/ReviewRequestModal';
import RequestDetailsModal from '../../components/forms/RequestDetailsModal';
import { formatDate, isOverdue24h } from '../../utils/formatters';
import { REQUEST_CATEGORIES, REQUEST_PRIORITY, REQUEST_STATUS } from '../../constants';
import { CheckSquare, Eye, AlertTriangle, Clock } from 'lucide-react';

const TeamRequests = () => {
  const { currentUser } = useAuth();
  const { requests } = useRequests();

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'all'
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  const [reviewingRequest, setReviewingRequest] = useState(null);
  const [inspectingRequest, setInspectingRequest] = useState(null);

  // Filter for requests belonging to current manager's team
  const teamRequests = useMemo(() => {
    const currentUserId = String(currentUser?._id || currentUser?.id || '');
    const filtered = requests.filter(
      (r) => !r.managerId || String(r.managerId?._id || r.managerId) === currentUserId
    );
    return filtered.length > 0 ? filtered : requests;
  }, [requests, currentUser]);

  const filteredRequests = useMemo(() => {
    return teamRequests.filter((r) => {
      // Tab filter
      if (activeTab === 'pending' && r.status !== REQUEST_STATUS.PENDING) return false;

      const matchSearch =
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.employeeName.toLowerCase().includes(search.toLowerCase());

      const matchCategory = selectedCategory === 'all' || r.category === selectedCategory;
      const matchPriority = selectedPriority === 'all' || r.priority === selectedPriority;

      return matchSearch && matchCategory && matchPriority;
    });
  }, [teamRequests, activeTab, search, selectedCategory, selectedPriority]);

  const pendingCount = teamRequests.filter((r) => r.status === REQUEST_STATUS.PENDING).length;

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedPriority('all');
  };

  const columns = [
    {
      header: 'S.No',
      cellClassName: 'text-xs font-mono font-bold text-slate-500 w-16',
      render: (r, rowIdx, serialNo) => (
        <span className="font-mono text-xs text-slate-500 font-bold">#{serialNo || rowIdx + 1}</span>
      ),
    },
    {
      header: 'Request Title & Category',
      render: (r) => {
        const isOverdue = isOverdue24h(r.submittedAt, r.status);
        return (
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-900">{r.title}</span>
              {isOverdue && (
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                  &gt;24h Overdue
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400">{r.category}</span>
          </div>
        );
      },
    },
    {
      header: 'Requester',
      render: (r) => (
        <div>
          <span className="text-xs font-semibold text-slate-800 block">{r.employeeName}</span>
          <span className="text-[10px] text-slate-400">{r.employeeDepartment}</span>
        </div>
      ),
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
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setInspectingRequest(r)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          {r.status === REQUEST_STATUS.PENDING ? (
            <button
              onClick={() => setReviewingRequest(r)}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              Review
            </button>
          ) : (
            <span className="text-xs text-slate-400 italic">Reviewed</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Team Request Review</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review, approve, or reject requests submitted by members of your assigned team.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'pending'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pending Review</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] ${
              pendingCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'all'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>All Team Requests</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600">
            {teamRequests.length}
          </span>
        </button>
      </div>

      {/* Filter toolbar */}
      <DataFilterBar
        search={search}
        onSearchChange={setSearch}
        category={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categoryOptions={REQUEST_CATEGORIES}
        priority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        priorityOptions={Object.values(REQUEST_PRIORITY)}
        onReset={handleResetFilters}
        searchPlaceholder="Filter by title, ID or requester name..."
      />

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredRequests}
        keyField="id"
        pageSize={6}
        emptyMessage="No team requests match criteria"
        emptySubtext="Switch tabs or clear filters to view requests."
      />

      {/* Review Modal */}
      <ReviewRequestModal
        isOpen={!!reviewingRequest}
        onClose={() => setReviewingRequest(null)}
        request={reviewingRequest}
      />

      {/* Details Modal */}
      <RequestDetailsModal
        isOpen={!!inspectingRequest}
        onClose={() => setInspectingRequest(null)}
        request={inspectingRequest}
      />
    </div>
  );
};

export default TeamRequests;

