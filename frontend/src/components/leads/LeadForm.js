import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const LeadForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [initialData, setInitialData] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm();

  const isEditing = Boolean(id);

  // Fetch lead data if editing
  useEffect(() => {
    if (isEditing) {
      fetchLead();
    }
  }, [id]);

  const fetchLead = async () => {
    try {
      const response = await axios.get(`/api/leads/${id}`);
      const lead = response.data.lead;
      setInitialData(lead);
      
      // Set form values
      Object.keys(lead).forEach(key => {
        if (key !== '_id' && key !== 'user' && key !== 'createdAt' && key !== 'updatedAt') {
          setValue(key, lead[key]);
        }
      });
    } catch (error) {
      console.error('Error fetching lead:', error);
      toast.error('Failed to fetch lead data');
      navigate('/');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEditing) {
        await axios.put(`/api/leads/${id}`, data);
        toast.success('Lead updated successfully');
      } else {
        await axios.post('/api/leads', data);
        toast.success('Lead created successfully');
      }
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to save lead';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await axios.delete(`/api/leads/${id}`);
      toast.success('Lead deleted successfully');
      navigate('/');
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Failed to delete lead');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </button>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Lead' : 'Create New Lead'}
            </h1>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Information */}
          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label htmlFor="first_name" className="form-label">
                  First Name *
                </label>
                <input
                  type="text"
                  id="first_name"
                  {...register('first_name', { required: 'First name is required' })}
                  className={`input ${errors.first_name ? 'border-danger-300' : ''}`}
                  placeholder="Enter first name"
                />
                {errors.first_name && (
                  <p className="form-error">{errors.first_name.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="last_name" className="form-label">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="last_name"
                  {...register('last_name', { required: 'Last name is required' })}
                  className={`input ${errors.last_name ? 'border-danger-300' : ''}`}
                  placeholder="Enter last name"
                />
                {errors.last_name && (
                  <p className="form-error">{errors.last_name.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className={`input ${errors.email ? 'border-danger-300' : ''}`}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="form-error">{errors.email.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  {...register('phone', { required: 'Phone number is required' })}
                  className={`input ${errors.phone ? 'border-danger-300' : ''}`}
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="form-error">{errors.phone.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label htmlFor="company" className="form-label">
                  Company Name *
                </label>
                <input
                  type="text"
                  id="company"
                  {...register('company', { required: 'Company name is required' })}
                  className={`input ${errors.company ? 'border-danger-300' : ''}`}
                  placeholder="Enter company name"
                />
                {errors.company && (
                  <p className="form-error">{errors.company.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="city" className="form-label">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  {...register('city', { required: 'City is required' })}
                  className={`input ${errors.city ? 'border-danger-300' : ''}`}
                  placeholder="Enter city"
                />
                {errors.city && (
                  <p className="form-error">{errors.city.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="state" className="form-label">
                  State *
                </label>
                <input
                  type="text"
                  id="state"
                  {...register('state', { required: 'State is required' })}
                  className={`input ${errors.state ? 'border-danger-300' : ''}`}
                  placeholder="Enter state"
                />
                {errors.state && (
                  <p className="form-error">{errors.state.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Lead Details */}
          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Lead Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label htmlFor="source" className="form-label">
                  Lead Source *
                </label>
                <select
                  id="source"
                  {...register('source', { required: 'Lead source is required' })}
                  className={`input ${errors.source ? 'border-danger-300' : ''}`}
                >
                  <option value="">Select source</option>
                  <option value="website">Website</option>
                  <option value="facebook_ads">Facebook Ads</option>
                  <option value="google_ads">Google Ads</option>
                  <option value="referral">Referral</option>
                  <option value="events">Events</option>
                  <option value="other">Other</option>
                </select>
                {errors.source && (
                  <p className="form-error">{errors.source.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="status" className="form-label">
                  Status *
                </label>
                <select
                  id="status"
                  {...register('status', { required: 'Status is required' })}
                  className={`input ${errors.status ? 'border-danger-300' : ''}`}
                >
                  <option value="">Select status</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="lost">Lost</option>
                  <option value="won">Won</option>
                </select>
                {errors.status && (
                  <p className="form-error">{errors.status.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="score" className="form-label">
                  Lead Score (0-100) *
                </label>
                <input
                  type="number"
                  id="score"
                  min="0"
                  max="100"
                  {...register('score', { 
                    required: 'Score is required',
                    min: { value: 0, message: 'Score must be at least 0' },
                    max: { value: 100, message: 'Score must be at most 100' }
                  })}
                  className={`input ${errors.score ? 'border-danger-300' : ''}`}
                  placeholder="Enter score (0-100)"
                />
                {errors.score && (
                  <p className="form-error">{errors.score.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lead_value" className="form-label">
                  Lead Value ($) *
                </label>
                <input
                  type="number"
                  id="lead_value"
                  min="0"
                  step="0.01"
                  {...register('lead_value', { 
                    required: 'Lead value is required',
                    min: { value: 0, message: 'Lead value must be positive' }
                  })}
                  className={`input ${errors.lead_value ? 'border-danger-300' : ''}`}
                  placeholder="Enter lead value"
                />
                {errors.lead_value && (
                  <p className="form-error">{errors.lead_value.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="last_activity_at" className="form-label">
                  Last Activity Date
                </label>
                <input
                  type="datetime-local"
                  id="last_activity_at"
                  {...register('last_activity_at')}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Qualified Lead</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_qualified"
                    {...register('is_qualified')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_qualified" className="text-sm text-gray-700">
                    Mark as qualified
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
              >
                Cancel
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="btn-danger flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{deleting ? 'Deleting...' : 'Delete Lead'}</span>
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Saving...' : (isEditing ? 'Update Lead' : 'Create Lead')}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default LeadForm;
