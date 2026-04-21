import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">JobTracker</Link>
      </div>
      <div className="nav-links">
        <Link to="/">Dashboard</Link>
        <Link to="/profile">Profile</Link>
        <button onClick={logout} className="nav-logout">Logout</button>
      </div>
    </nav>
  );
}