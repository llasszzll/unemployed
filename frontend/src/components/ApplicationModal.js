import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function ApplicationModal({ application, onClose, onSave }) {
  const [formData, setFormData] = useState({
    companyName: '',
    position: '',
    applicationDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    feedback: '',
    rejectionReason: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (application) {
      setFormData({
        companyName: application.companyName || '',
        position: application.position || '',
        applicationDate: application.applicationDate 
          ? new Date(application.applicationDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        status: application.status || 'pending',
        feedback: application.feedback || '',
        rejectionReason: application.rejectionReason || '',
        notes: application.notes || ''
      });
    }
  }, [application]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (application && application._id) {
        await axios.put(`${API_URL}/applications/${application._id}`, formData);
      } else {
        await axios.post(`${API_URL}/applications`, formData);
      }
      onSave();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = formData.status === 'rejected' || formData.status === 'no_response';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{application && application._id ? 'Edit' : 'Add'} Application</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="companyName">Company Name *</label>
            <input
              type="text"
              id="companyName"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="position">Position *</label>
            <input
              type="text"
              id="position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="applicationDate">Application Date</label>
            <input
              type="date"
              id="applicationDate"
              value={formData.applicationDate}
              onChange={(e) => setFormData({ ...formData, applicationDate: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="pending">Pending</option>
              <option value="interview">Interview</option>
              <option value="rejected">Rejected</option>
              <option value="no_response">No Response</option>
              <option value="accepted">Accepted</option>
            </select>
          </div>
          {showFeedback && (
            <>
              <div className="form-group">
                <label htmlFor="feedback">Feedback</label>
                <textarea
                  id="feedback"
                  value={formData.feedback}
                  onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                  placeholder="Enter any feedback received..."
                />
              </div>
              {formData.status === 'rejected' && (
                <div className="form-group">
                  <label htmlFor="rejectionReason">Reason for Rejection</label>
                  <textarea
                    id="rejectionReason"
                    value={formData.rejectionReason}
                    onChange={(e) => setFormData({ ...formData, rejectionReason: e.target.value })}
                    placeholder="Enter reason for rejection..."
                  />
                </div>
              )}
            </>
          )}
          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes..."
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
