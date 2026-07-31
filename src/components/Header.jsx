import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';
const API_URL = import.meta.env.VITE_API_URL || '/api';

const Header = ({ setCurrentPage, isLoggedIn, setIsLoggedIn, openModal }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  // FIXED: Dynamic login event handler connected to port 5000
  const handleSignInClick = async () => {
    const enteredEmail = prompt("Please enter your email address to Sign In:");
    if (!enteredEmail) return;

    try {
      // FIXED: Preserving your exact required full URL structure using backticks
      const response = await fetch(`${API_URL}/get_user/${encodeURIComponent(enteredEmail.trim())}`);
      const data = await response.json();
      console.log("Login lookup response data:", data);
      if (response.ok) {
        // Since server.js now safely outputs rows[0], data IS your single user object record!
        sessionStorage.setItem('currentUserId', data.id);
        sessionStorage.setItem('currentUserEmail', data.email);
        sessionStorage.setItem('currentUserPassword', data.password || '');
        sessionStorage.setItem('currentUserPhone', data.phone || '');
        sessionStorage.setItem('currentUserGender', data.gender || '');
        sessionStorage.setItem('currentUserAge', data.age || '');
        sessionStorage.setItem('currentUserPartyAffiliation', data.party_affiliation || '');
        sessionStorage.setItem('currentUserZipCode', data.zip_code || '');
        sessionStorage.setItem('currentUserAccordionPanels', data.accordion_panels_stay_open || '');
        sessionStorage.setItem('currentUserVotingRecord', data.voting_record || '');

        const votingRecordStr = typeof data.voting_record === 'string'
          ? data.voting_record
          : JSON.stringify(data.voting_record || []);
        sessionStorage.setItem('currentUserVotingRecord', votingRecordStr);

        alert(`🎉 Welcome back! Logged in as User ID: ${data.id}`);
        setIsLoggedIn(true);
      } else {
        alert(data.error || "User not found. Please verify your email or sign up.");
      }
    } catch (error) {
      console.error("Login lookup failure:", error);
      alert("Failed to communicate with database server on port 5000.");
    }
  };

const handleLogin = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        
        if (response.ok) {
            // Securely store the authentication string token inside browser memory
            localStorage.setItem('voter_token', data.token);
            alert('Logged in successfully!');
        } else {
            alert(data.error);
        }
    } catch (err) {
        console.error('Authentication transmission failed');
    }
};

// FIXED: Explicit logout handler to wipe application state locks
  const handleSignOutClick = () => {
    sessionStorage.clear(); // Clear all user tokens out of browser memory cache
    setIsLoggedIn(false);
    setShowDropdown(false);
  };

  return (
    <header className="site-header">
      <div className="brand">
        <span className="brand-icon">🗳️</span>
        <span className="brand-title">Power to the People!</span>
      </div>

      <div className="control-panel">
        <nav className="nav-menu">
          {['home', 'polls', 'ideas', 'news', 'about'].map((page) => (
            <NavLink
              key={page}
              to={page === 'home' ? '/' : `/${page}`}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              {page.charAt(0).toUpperCase() + page.slice(1)}
            </NavLink>
          ))}
        </nav>

        {/* Conditional Rendering UI Row */}
        {!isLoggedIn ? (
          <button className="btn-signin" onClick={handleSignInClick}>
            Sign In
          </button>
        ) : (
          <div className="profile-container">
            <button className="profile-trigger" onClick={() => setShowDropdown(!showDropdown)}>
              👤
            </button>
            {showDropdown && (
              <div className="dropdown-menu">
                <span className="dropdown-item" onClick={() => { openModal('profile'); setShowDropdown(false); }}>
                  👤 Profile
                </span>
                <span className="dropdown-item" onClick={() => { openModal('account'); setShowDropdown(false); }}>
                  🛡️ Account Settings
                </span>
                <span className="dropdown-item" onClick={() => { openModal('preferences'); setShowDropdown(false); }}>
                  ⚙️ Preferences
                </span>
                <div className="dropdown-divider"></div>
                <span className="dropdown-item" onClick={handleSignOutClick}>
                  Sign out
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
