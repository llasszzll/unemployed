import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Loading from './Loading';

const API_URL = 'http://localhost:5000/api';

export default function PublicProfile() {
  const [userData, setUserData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { profileId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_URL}/public/${profileId}`);
        setUserData(res.data.user);
        setApplications(res.data.applications);
      } catch (err) {
        console.error('Public profile error:', err);
        setError(err.response?.data?.message || 'Profile not found');
      } finally {
        setLoading(false);
      }
    };
    if (profileId) {
      fetchData();
    }
  }, [profileId]);

  const handleResumeDownload = async () => {
    try {
      const res = await axios.get(`${API_URL}/public/${profileId}/resume`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      const contentDisposition = res.headers['content-disposition'];
      let fileName = 'resume';
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch) fileName = fileNameMatch[1];
      }
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    noResponse: applications.filter(a => a.status === 'no_response').length,
    interview: applications.filter(a => a.status === 'interview').length
  };

  if (loading) return <Loading />;
  if (error) return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>{error}</h1>
        <Link to="/login">Go to Login</Link>
      </div>
    </div>
  );

  return (
    <div className="profile public-profile">
      <div className="profile-header">
        <h1>{userData.fullName || userData.username}'s Profile</h1>
      </div>

      {userData.resume && (
        <div className="public-resume-section">
          <button className="btn-primary" onClick={handleResumeDownload}>
            Download Resume
          </button>
        </div>
      )}

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
        <h2>Job Applications ({stats.total})</h2>
        <div className="applications-list">
          {applications.map(app => (
            <div key={app._id} className={`application-card ${app.status}`}>
              <div className="application-info">
                <h3>{app.companyName}</h3>
                <p className="position">{app.position}</p>
                <p className="date">
                  Applied: {new Date(app.applicationDate).toLocaleDateString()}
                </p>
                {app.feedback && (
                  <p className="feedback">Feedback: {app.feedback}</p>
                )}
                {app.rejectionReason && (
                  <p className="rejection-reason">Reason: {app.rejectionReason}</p>
                )}
              </div>
              <div className="application-status">
                <span className={`status-badge ${app.status}`}>
                  {app.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
