import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ApplicationModal from './ApplicationModal';
import Loading from './Loading';

const API_URL = 'http://localhost:5000/api';

export default function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

  const fetchApplications = async () => {
    try {
      const res = await axios.get(`${API_URL}/applications`);
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    noResponse: applications.filter(a => a.status === 'no_response').length,
    interview: applications.filter(a => a.status === 'interview').length
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;
    try {
      await axios.delete(`${API_URL}/applications/${id}`);
      fetchApplications();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.fullName || user?.username || 'User'}!</h1>
        <p>Track and manage your job applications</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Applications</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card interview">
          <div className="stat-value">{stats.interview}</div>
          <div className="stat-label">Interview</div>
        </div>
        <div className="stat-card no-response">
          <div className="stat-value">{stats.noResponse}</div>
          <div className="stat-label">No Response</div>
        </div>
        <div className="stat-card rejected">
          <div className="stat-value">{stats.rejected}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>

      <div className="applications-section">
        <div className="section-header">
          <h2>Recent Applications</h2>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + Add Application
          </button>
        </div>

        {applications.length === 0 ? (
          <div className="empty-state">
            <p>No job applications yet. Start tracking your applications!</p>
          </div>
        ) : (
          <div className="applications-list">
            {applications.slice(0, 10).map(app => (
              <div key={app._id} className={`application-card ${app.status}`}>
                <div className="application-info">
                  <h3>{app.companyName}</h3>
                  <p className="position">{app.position}</p>
                  <p className="date">
                    Applied: {new Date(app.applicationDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="application-status">
                  <span className={`status-badge ${app.status}`}>
                    {app.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="application-actions">
                  <button onClick={() => setShowModal(app)}>Edit</button>
                  <button onClick={() => handleDelete(app._id)} className="delete-btn">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <ApplicationModal
          application={showModal === true ? null : showModal}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchApplications();
          }}
        />
      )}
    </div>
  );
}
