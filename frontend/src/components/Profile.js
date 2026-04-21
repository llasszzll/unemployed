import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

const API_URL = 'http://localhost:5000/api';

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({ fullName: '', phone: '' });
  const [resumeFile, setResumeFile] = useState(null);
  const { user, logout } = useAuth();
  const [filter, setFilter] = useState('all');

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/user/profile`);
      setUserData(res.data.user);
      setApplications(res.data.applications);
      setProfileData({
        fullName: res.data.user.fullName || '',
        phone: res.data.user.phone || ''
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/user/profile`, profileData);
      setEditing(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;
    
    const formData = new FormData();
    formData.append('resume', resumeFile);

    try {
      await axios.post(`${API_URL}/user/resume`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResumeFile(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResumeDownload = async () => {
    try {
      const res = await axios.get(`${API_URL}/user/resume`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', userData.resume.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResumeDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your resume?')) return;
    try {
      await axios.delete(`${API_URL}/user/resume`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async () => {
    const profileUrl = userData?.profileId ? `${window.location.origin}/p/${userData.profileId}` : '';
    const shareData = {
      title: `${userData.fullName || userData.username}'s Job Profile`,
      text: `Check out my job application profile - ${stats.total} applications sent!`,
      url: profileUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          navigator.clipboard.writeText(profileUrl).then(() => {
            alert('Profile link copied to clipboard!');
          });
        }
      }
    } else {
      navigator.clipboard.writeText(profileUrl).then(() => {
        alert('Profile link copied to clipboard!');
      });
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    noResponse: applications.filter(a => a.status === 'no_response').length,
    interview: applications.filter(a => a.status === 'interview').length
  };

  if (loading) return <Loading />;

  return (
    <div className="profile">
      <div className="profile-header">
        <h1>My Profile</h1>
        <button className="btn-share" onClick={handleShare}>
          Share Profile
        </button>
      </div>

      <div className="profile-content">
        <div className="profile-info">
          <div className="profile-card">
            <h2>Personal Information</h2>
            {editing ? (
              <form onSubmit={handleProfileUpdate}>
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="info-row">
                  <span className="label">Username:</span>
                  <span className="value">{userData.username}</span>
                </div>
                <div className="info-row">
                  <span className="label">Email:</span>
                  <span className="value">{userData.email}</span>
                </div>
                <div className="info-row">
                  <span className="label">Full Name:</span>
                  <span className="value">{userData.fullName || 'Not set'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Phone:</span>
                  <span className="value">{userData.phone || 'Not set'}</span>
                </div>
                <button className="btn-primary" onClick={() => setEditing(true)}>
                  Edit Profile
                </button>
              </>
            )}
          </div>

          <div className="profile-card">
            <h2>Resume</h2>
            {userData.resume ? (
              <div className="button-group">
                <button className="btn-primary" onClick={handleResumeDownload}>
                  Download Resume
                </button>
                <button className="btn-danger" onClick={handleResumeDelete}>
                  Delete
                </button>
              </div>
            ) : (
              <>
                <p className="no-resume-message">You have not uploaded a resume yet.</p>
                <form onSubmit={handleResumeUpload}>
                  <div className="form-group">
                    <label htmlFor="resume">Upload Resume (PDF, DOC, DOCX)</label>
                    <input
                      type="file"
                      id="resume"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setResumeFile(e.target.files[0])}
                    />
                  </div>
                  <button type="submit" className="btn-primary" disabled={!resumeFile}>
                    Upload
                  </button>
                </form>
              </>
            )}
          </div>

          <button className="btn-logout" onClick={logout}>
            Logout
          </button>
        </div>

        <div className="applications-section">
          <h2>All Applications ({stats.total})</h2>
          
          <div className="filter-tabs">
            <button 
              className={filter === 'all' ? 'active' : ''} 
              onClick={() => setFilter('all')}
            >
              All ({stats.total})
            </button>
            <button 
              className={filter === 'pending' ? 'active' : ''} 
              onClick={() => setFilter('pending')}
            >
              Pending ({stats.pending})
            </button>
            <button 
              className={filter === 'interview' ? 'active' : ''} 
              onClick={() => setFilter('interview')}
            >
              Interview ({stats.interview})
            </button>
            <button 
              className={filter === 'no_response' ? 'active' : ''} 
              onClick={() => setFilter('no_response')}
            >
              No Response ({stats.noResponse})
            </button>
            <button 
              className={filter === 'rejected' ? 'active' : ''} 
              onClick={() => setFilter('rejected')}
            >
              Rejected ({stats.rejected})
            </button>
          </div>

          <div className="applications-list">
            {filteredApplications.map(app => (
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
    </div>
  );
}
