import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRequests } from '../../context/RequestContext';
import DataTable from '../../components/common/DataTable';
import DataFilterBar from '../../components/common/DataFilterBar';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import RequestDetailsModal from '../../components/forms/RequestDetailsModal';
import { formatDate } from '../../utils/formatters';
import { REQUEST_CATEGORIES, REQUEST_PRIORITY, REQUEST_STATUS } from '../../constants';
import { PlusCircle, Eye, FileText } from 'lucide-react';

const MyRequests = () => {
  const { currentUser } = useAuth();
  const { requests } = useRequests();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Filter requests belonging to this employee
  const myRequests = useMemo(() => {
    return requests.filter((r) => r.employeeId === currentUser?.id);
  }, [requests, currentUser]);

  const filteredRequests = useMemo(() => {
    return myRequests.filter((r) => {
      const matchSearch =
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toLowerCase().includes(search.toLowerCase());

      const matchStatus = selectedStatus === 'all' || r.status === selectedStatus;
      const matchCategory = selectedCategory === 'all' || r.category === selectedCategory;
      const matchPriority = selectedPriority === 'all' || r.priority === selectedPriority;

      return matchSearch && matchStatus && matchCategory && matchPriority;
    });
  }, [myRequests, search, selectedStatus, selectedCategory, selectedPriority]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedStatus('all');
    setSelectedCategory('all');
    setSelectedPriority('all');
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      cellClassName: 'text-xs font-mono font-bold text-slate-700',
    },
    {
      header: 'Title & Category',
      render: (r) => (
        <div>
          <span className="font-bold text-xs text-slate-900 block">{r.title}</span>
          <span className="text-[11px] text-slate-400">{r.category}</span>
        </div>
      ),
    },
    {
      header: 'Assigned Reviewer',
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
      header: 'Actions',
      align: 'right',
      render: (r) => (
        <button
          onClick={() => setSelectedRequest(r)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Track Status</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Requests Register</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track real-time progress, manager approval comments, and discussion threads on your requests.
          </p>
        </div>

        <button
          onClick={() => navigate('/employee/submit')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Submit Request</span>
        </button>
      </div>

      {/* Filter toolbar */}
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
        emptySubtext="You haven't submitted any requests matching your criteria."
        emptyAction={
          <button
            onClick={() => navigate('/employee/submit')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors"
          >
            Submit a Request
          </button>
        }
      />

      {/* Details & Tracker Modal */}
      <RequestDetailsModal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        request={selectedRequest}
      />
    </div>
  );
};

export default MyRequests;

