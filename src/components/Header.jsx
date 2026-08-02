import { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const Header = ({ setCurrentPage, isLoggedIn, setIsLoggedIn, openModal }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownBoundaryRef = useRef(null);

    // Auto-Closing listener detects clicks anywhere outside the avatar area box
    useEffect(() => {
        const handleOutsideClickClose = (event) => {
            if (dropdownBoundaryRef.current && !dropdownBoundaryRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleOutsideClickClose);
        }
        return () => {
            document.removeEventListener('mousedown', handleOutsideClickClose);
        };
    }, [showDropdown]);

    const handleSignInClick = async () => {
        const enteredEmail = prompt("Please enter your email address to Sign In:");
        if (!enteredEmail) return;
        try {
            const response = await fetch(`${API_URL}/get_user/${encodeURIComponent(enteredEmail.trim())}`);
            const data = await response.json();
            if (response.ok) {
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
                
                const votingRecordStr = typeof data.voting_record === 'string' ? data.voting_record : JSON.stringify(data.voting_record || []);
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

    const handleSignOutClick = () => {
        sessionStorage.clear();
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

                {!isLoggedIn ? (
                    <button className="btn-signin" onClick={handleSignInClick}>
                        Sign In
                    </button>
                ) : (
                    <div className="profile-container" ref={dropdownBoundaryRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                        
                        <div className={`diagnostic-led-dot ${showDropdown ? 'diagnostic-led-active' : 'diagnostic-led-inactive'}`} />

                        <button 
                            className="profile-trigger" 
                            style={{ fontSize: '22px', border: 'none', background: 'none', cursor: 'pointer', padding: '4px 8px' }}
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            👤
                        </button>
                        
                        {/* 🚀 THE FIXED SHORT-CIRCUIT MOUNT VECTOR:
                           Instead of toggling 'display: none', using '{showDropdown && (...)}' ensures that 
                           the dropdown is physically deleted from the DOM tree memory layout the exact 
                           millisecond an option is clicked, stopping re-render state freezing dead in its tracks! */}
                        {showDropdown && (
                            <div 
                                className="dropdown-menu" 
                                style={{ 
                                    display: 'flex',
                                    position: 'absolute',
                                    right: 0,
                                    top: '100%',
                                    marginTop: '8px',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #dddddd',
                                    borderRadius: '6px',
                                    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
                                    flexDirection: 'column',
                                    minWidth: '180px',
                                    padding: '6px 0',
                                    zIndex: 999999999
                                }}
                            >
                                <span 
                                    className="dropdown-item" 
                                    style={{ padding: '10px 16px', fontSize: '14px', color: '#333', cursor: 'pointer', display: 'block', textAlign: 'left' }}
                                    onClick={() => {
                                        setShowDropdown(false); // 🔒 1. Delete dropdown nodes immediately
                                        openModal('profile');    // 🚀 2. Mount your profile dashboard modal safely
                                    }}
                                >
                                    👤 Profile
                                </span>
                                <span 
                                    className="dropdown-item" 
                                    style={{ padding: '10px 16px', fontSize: '14px', color: '#333', cursor: 'pointer', display: 'block', textAlign: 'left' }}
                                    onClick={() => {
                                        setShowDropdown(false);
                                        openModal('account');
                                    }}
                                >
                                    🛡️ Account Settings</span>
                                <span 
                                    className="dropdown-item" 
                                    style={{ padding: '10px 16px', fontSize: '14px', color: '#333', cursor: 'pointer', display: 'block', textAlign: 'left' }}
                                    onClick={() => {
                                        setShowDropdown(false);
                                        openModal('preferences');
                                    }}
                                >
                                    ⚙️ Preferences
                                </span>
                                <div className="dropdown-divider" style={{ height: '1px', backgroundColor: '#eeeeee', margin: '6px 0' }} />
                                <span 
                                    className="dropdown-item" 
                                    style={{ padding: '10px 16px', fontSize: '14px', color: '#dc2626', cursor: 'pointer', display: 'block', textAlign: 'left' }} 
                                    onClick={handleSignOutClick}
                                >
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
