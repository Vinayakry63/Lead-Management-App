import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, LogOut, Filter, X, Search } from 'lucide-react';
import axios from 'axios';
axios.defaults.withCredentials = true;
import toast from 'react-hot-toast';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // AG Grid column definitions
  const columnDefs = useMemo(() => [
    {
      headerName: 'Name',
      field: 'full_name',
      sortable: true,
      filter: true,
      cellRenderer: (params) => {
        const lead = params.data;
        return (
          <div className="font-medium" style={{ maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={lead.first_name + ' ' + lead.last_name}>
            <div>{lead.first_name} {lead.last_name}</div>
            <div className="text-sm text-gray-500" style={{ maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={lead.email}>{lead.email}</div>
          </div>
        );
      }
    },
    {
      headerName: 'Company',
      field: 'company',
      sortable: true,
      filter: true,
      width: 150
    },
    {
      headerName: 'Location',
      field: 'city',
      sortable: true,
      filter: true,
      cellRenderer: (params) => {
        const lead = params.data;
        return `${lead.city}, ${lead.state}`;
      },
      width: 120
    },
    {
      headerName: 'Source',
      field: 'source',
      sortable: true,
      filter: true,
      cellRenderer: (params) => {
        const source = params.value;
        const sourceColors = {
          website: 'bg-blue-100 text-blue-800',
          facebook_ads: 'bg-purple-100 text-purple-800',
          google_ads: 'bg-green-100 text-green-800',
          referral: 'bg-yellow-100 text-yellow-800',
          events: 'bg-pink-100 text-pink-800',
          other: 'bg-gray-100 text-gray-800'
        };
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${sourceColors[source] || sourceColors.other}`}>
            {source.replace('_', ' ')}
          </span>
        );
      },
      width: 120
    },
    {
      headerName: 'Status',
      field: 'status',
      sortable: true,
      filter: true,
      cellRenderer: (params) => {
        const status = params.value;
        const statusColors = {
          new: 'bg-blue-100 text-blue-800',
          contacted: 'bg-yellow-100 text-yellow-800',
          qualified: 'bg-green-100 text-green-800',
          lost: 'bg-red-100 text-red-800',
          won: 'bg-emerald-100 text-emerald-800'
        };
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status] || statusColors.new}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
      width: 100
    },
    {
      headerName: 'Score',
      field: 'score',
      sortable: true,
      filter: true,
      width: 80,
      cellRenderer: (params) => {
        const score = params.value;
        let color = 'text-gray-600';
        if (score >= 80) color = 'text-green-600';
        else if (score >= 60) color = 'text-yellow-600';
        else color = 'text-red-600';
        
        return <span className={`font-medium ${color}`}>{score}</span>;
      }
    },
    {
      headerName: 'Value',
      field: 'lead_value',
      sortable: true,
      filter: true,
      width: 100,
      cellRenderer: (params) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0
        }).format(params.value);
      }
    },
    {
      headerName: 'Qualified',
      field: 'is_qualified',
      sortable: true,
      filter: true,
      width: 100,
      cellRenderer: (params) => {
        return params.value ? (
          <span className="text-green-600">✓</span>
        ) : (
          <span className="text-gray-400">✗</span>
        );
      }
    },
    {
      headerName: 'Actions',
      field: 'actions',
      sortable: false,
      filter: false,
      width: 120,
      cellRenderer: (params) => {
        const lead = params.data;
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/leads/${lead._id}/edit`)}
              className="text-primary-600 hover:text-primary-800 text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteLead(lead._id)}
              className="text-danger-600 hover:text-danger-800 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        );
      }
    }
  ], [navigate]);

  // AG Grid default column properties
  const defaultColDef = useMemo(() => ({
    flex: 1,
    minWidth: 100,
    resizable: true,
    sortable: true,
    filter: true
  }), []);

  // Fetch leads with pagination and filters
  const fetchLeads = async (page = 1, newFilters = filters) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      });

      if (Object.keys(newFilters).length > 0) {
        params.append('filters', JSON.stringify(newFilters));
      }

  const apiBaseUrl = process.env.REACT_APP_API_URL || '';
  const response = await axios.get(`${apiBaseUrl}/api/leads?${params}`);
      setLeads(response.data.data);
      setPagination({
        page: response.data.page,
        limit: response.data.limit,
        total: response.data.total,
        totalPages: response.data.totalPages
      });
      // Show debug info in the UI for troubleshooting
      window._leadsApiDebug = {
        apiResponse: response.data,
        leads: response.data.data,
        pagination: {
          page: response.data.page,
          limit: response.data.limit,
          total: response.data.total,
          totalPages: response.data.totalPages
        }
      };
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Handle lead deletion
  const handleDeleteLead = async (leadId) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) {
      return;
    }

    try {
  const apiBaseUrl = process.env.REACT_APP_API_URL || '';
  await axios.delete(`${apiBaseUrl}/api/leads/${leadId}`);
      toast.success('Lead deleted successfully');
      fetchLeads(pagination.page, filters);
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Failed to delete lead');
    }
  };

  // Handle filter changes
  const handleFilterChange = (field, operator, value) => {
    const newFilters = { ...filters };
    if (value !== undefined && value !== '') {
      newFilters[field] = { operator, value };
    } else {
      delete newFilters[field];
    }
    setFilters(newFilters);
  };

  // Apply filters
  const applyFilters = () => {
    fetchLeads(1, filters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
    fetchLeads(1, {});
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    console.log('Page change requested:', { currentPage: pagination.page, newPage, totalPages: pagination.totalPages });
    fetchLeads(newPage, filters);
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Lead Management System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/leads/new')}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Lead</span>
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="form-label">Status</label>
                <select
                  value={filters.status?.value || ''}
                  onChange={(e) => handleFilterChange('status', 'equals', e.target.value)}
                  className="input"
                >
                  <option value="">All Statuses</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="lost">Lost</option>
                  <option value="won">Won</option>
                </select>
              </div>

              {/* Source Filter */}
              <div>
                <label className="form-label">Source</label>
                <select
                  value={filters.source?.value || ''}
                  onChange={(e) => handleFilterChange('source', 'equals', e.target.value)}
                  className="input"
                >
                  <option value="">All Sources</option>
                  <option value="website">Website</option>
                  <option value="facebook_ads">Facebook Ads</option>
                  <option value="google_ads">Google Ads</option>
                  <option value="referral">Referral</option>
                  <option value="events">Events</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Score Range Filter */}
              <div>
                <label className="form-label">Score Range</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    min="0"
                    max="100"
                    className="input"
                    onChange={(e) => {
                      const min = parseInt(e.target.value);
                      const max = filters.score?.value?.[1] || 100;
                      if (min >= 0 && min <= max) {
                        handleFilterChange('score', 'between', [min, max]);
                      }
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    min="0"
                    max="100"
                    className="input"
                    onChange={(e) => {
                      const max = parseInt(e.target.value);
                      const min = filters.score?.value?.[0] || 0;
                      if (max >= min && max <= 100) {
                        handleFilterChange('score', 'between', [min, max]);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Qualified Filter */}
              <div>
                <label className="form-label">Qualified</label>
                <select
                  value={filters.is_qualified?.value ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      handleFilterChange('is_qualified', undefined, undefined);
                    } else {
                      handleFilterChange('is_qualified', 'equals', value === 'true');
                    }
                  }}
                  className="input"
                >
                  <option value="">All</option>
                  <option value="true">Qualified</option>
                  <option value="false">Not Qualified</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={applyFilters}
                className="btn-primary"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Leads Grid */}
        <div className="card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Leads ({pagination.total})
              </h2>
              <div className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <>
                <div className="ag-theme-alpine w-full h-96">
                  <div style={{ maxHeight: 400, overflowY: 'auto', marginBottom: 0 }}>
                    <AgGridReact
                      columnDefs={columnDefs}
                      rowData={leads}
                      defaultColDef={defaultColDef}
                      pagination={false}
                      domLayout="autoHeight"
                      rowHeight={60}
                      suppressCellFocus={true}
                      suppressRowClickSelection={true}
                    />
                  </div>
                  {/* Debug info for troubleshooting pagination */}
                  <div style={{marginTop: 8, color: '#b91c1c', fontSize: 12}}>
                    <strong>Debug:</strong> Page: {pagination.page}, Limit: {pagination.limit}, Total: {pagination.total}, TotalPages: {pagination.totalPages}<br/>
                    Leads on this page: {Array.isArray(leads) ? leads.length : 0}
                  </div>
                </div>

                {/* Pagination - Only show when there are multiple pages */}
                <div className="mt-6 flex items-center justify-between" style={{ background: '#fff', zIndex: 10, position: 'relative', paddingBottom: 16 }}>
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="px-4 py-2 text-sm font-medium text-white bg-gray-600 border border-gray-700 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Previous
                    </button>
                    <span className="px-4 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-md">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-700 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
