import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';

const Header = ({ setCurrentPage, isLoggedIn, setIsLoggedIn, openModal }) => {
  const [showDropdown, setShowDropdown] = useState(false);

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

        {/* Conditional Rendering: Sign In Button or Profile Icon */}
        {!isLoggedIn ? (
          <button className="btn-signin" onClick={() => setIsLoggedIn(true)}>
            Sign In
          </button>
        ) : (
          <div className="profile-container">
            <button
              className="profile-trigger"
              onClick={() => setShowDropdown(!showDropdown)}
            >
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
                <span className="dropdown-item" onClick={() => { setIsLoggedIn(false); setShowDropdown(false); }}>
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