import React, { useState } from 'react';

export default function TwoFactorLogin({ onAuthSuccess }) {
    const [view, setView] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [otpCode, setOtpCode] = useState('');
    
    // Status message trackers
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showOptionsNotice, setShowOptionsNotice] = useState(false);
    
    // Password Visibility State Hook
    const [showPasswordText, setShowPasswordText] = useState(false);
    
    const [userId, setUserId] = useState(null);

    // ZERO HARDCODING: Auto-detects local vs remote hosting without manual code changes
    const getBaseUrl = () => {
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            return 'http://localhost:5000';
        }
        return '';
    };

    const apiBaseUrl = `${getBaseUrl()}/api/auth`;

    const handleActionSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        setShowOptionsNotice(false);

        try {
            if (view === 'login') {
                // Phase 1: Verify email exists in the system
                const lookupRes = await fetch(`${getBaseUrl()}/api/get_user/${encodeURIComponent(email.trim().toLowerCase())}`);
                
                if (!lookupRes.ok) {
                    setErrorMessage('Your credentials failed. Please select an action below to proceed.');
                    setShowOptionsNotice(true);
                    return;
                }

                // Phase 2: Verify account password matches table records
                const loginRes = await fetch(`${apiBaseUrl}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email.trim(), password }),
                });
                const loginData = await loginRes.json();
                
                if (!loginRes.ok || loginData.error) {
                    setErrorMessage('Your credentials failed. Please select an action below to proceed.');
                    setShowOptionsNotice(true);
                    return;
                }
                
                // 🚀 FIXED SCOPE: Store all profile attributes safely into session storage right here where loginData is active!
                // Phase 2 Login Success: Store all attributes safely inside browser memory cache
                setUserId(loginData.userId);
                sessionStorage.setItem('currentUserId', loginData.userId);
                sessionStorage.setItem('currentUserEmail', loginData.email || '');
                             sessionStorage.setItem('currentUserName', loginData.name || '');
                sessionStorage.setItem('currentUserAddress', loginData.address || '');
                sessionStorage.setItem('currentUserGender', loginData.gender || '');
                sessionStorage.setItem('currentUserAge', loginData.age || '');
                sessionStorage.setItem('currentUserPartyAffiliation', loginData.party || 'Independent');
                const rawRecord = typeof loginData.voting_record === 'string'
                    ? loginData.voting_record
                    : JSON.stringify(loginData.voting_record || []);
                sessionStorage.setItem('currentUserVotingRecord', rawRecord);

                // Phase 3: Trigger the 2FA token generation sequence
                const sendOtpRes = await fetch(`${apiBaseUrl}/send-2fa`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        userId: loginData.userId, 
                        phone: loginData.phone 
                    }),
                });

                if (!sendOtpRes.ok) {
                    setErrorMessage('Failed to initialize two-factor verification sequence.');
                    return;
                }

                setView('2fa'); // Transition over to the 6-digit pin screen
            } 
            
            else if (view === 'register') {
                const res = await fetch(`${apiBaseUrl}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password, phone }),
                });
                const data = await res.json();
                if (!res.ok || data.error) return setErrorMessage(data.error || 'Registration failed.');
                
                setSuccessMessage('Registration successful! You can now log in.');
                setView('login');
            } 
            
            else if (view === '2fa') {
                const res = await fetch(`${apiBaseUrl}/verify-2fa`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        userId: userId, 
                        token: otpCode 
                    }),
                });
                const data = await res.json();
                
                if (!res.ok || data.error) return setErrorMessage(data.error || 'Invalid code.');
                
                if (onAuthSuccess) {
                    onAuthSuccess(userId);
                }
            }
        } catch (err) {
            setErrorMessage('Network connection failure. Transaction aborted.');
        }
    };

    const handleNavigationSwitch = (targetView) => {
        setErrorMessage('');
        setSuccessMessage('');
        setShowOptionsNotice(false);
        setView(targetView);
    };

    return (
        <div style={{ maxWidth: '420px', width: '100%', margin: '0 auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', fontFamily: 'sans-serif', backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h2 style={{ marginBottom: '20px', textTransform: 'capitalize', color: '#111', marginTop: '0', fontSize: '22px', textAlign: 'center' }}>
                Voter {view.replace('-', ' ')} Gateway
            </h2>

            {errorMessage && (
                <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '4px', marginBottom: '15px', fontSize: '14px', border: '1px solid #fca5a5', lineHeight: '1.4' }}>
                    {errorMessage}
                </div>
            )}

            {successMessage && (
                <div style={{ padding: '12px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '4px', marginBottom: '15px', fontSize: '14px', border: '1px solid #a7f3d0' }}>
                    {successMessage}
                </div>
            )}

            {showOptionsNotice && (
                <div style={{ padding: '15px', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', color: '#374151' }}>
                    <p style={{ margin: '0 0 12px 0', fontWeight: 'bold' }}>Available Recovery Actions:</p>
                    <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', listStyleType: 'square' }}>
                        <li>
                            <span style={{ color: '#0070f3', cursor: 'pointer', textDecoration: 'underline', fontWeight: '500' }} onClick={() => handleNavigationSwitch('login')}>
                                Try Entering Credentials Again
                            </span>
                        </li>
                        <li>
                            <span style={{ color: '#0070f3', cursor: 'pointer', textDecoration: 'underline', fontWeight: '500' }} onClick={() => alert('Password reset initialization pipeline triggered.')}>
                                Reset Account Password
                            </span>
                        </li>
                        <li>
                            <span style={{ color: '#10b981', cursor: 'pointer', textDecoration: 'underline', fontWeight: '500' }} onClick={() => handleNavigationSwitch('register')}>
                                Register as a New Voter Profile
                            </span>
                        </li>
                    </ul>
                </div>
            )}

            {view !== '2fa' ? (
                <form onSubmit={handleActionSubmit}>
                    {view === 'register' && (
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>Username</label>
                            <input type="text" required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }} value={username} onChange={(e) => setUsername(e.target.value)} />
                        </div>
                    )}

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>Email Address</label>
                        <input type="email" required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }} value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    {(view === 'login' || view === 'register') && (
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPasswordText ? 'text' : 'password'}
                                    required
                                    style={{ width: '100%', padding: '8px', paddingRight: '40px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <span
                                    onClick={() => setShowPasswordText(!showPasswordText)}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '16px', userSelect: 'none', color: '#666' }}
                                    title={showPasswordText ? 'Hide Password' : 'Show Password'}
                                >
                                    {showPasswordText ? '👁️' : '🙈'}
                                </span>
                            </div>
                        </div>
                    )}

                    {view === 'register' && (
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>Mobile Phone Number</label>
                            <input type="tel" required placeholder="303-555-0199" style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }} value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={view === 'login' && (!email.trim() || !password.trim())}
                        style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: (view === 'login' && (!email.trim() || !password.trim())) ? '#cbd5e1' : '#0070f3',
                            color: (view === 'login' && (!email.trim() || !password.trim())) ? '#64748b' : '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            cursor: (view === 'login' && (!email.trim() || !password.trim())) ? 'not-allowed' : 'pointer',
                            fontSize: '15px',
                            marginTop: '10px'
                        }}
                    >
                        Continue to {view}
                    </button>
                </form>
            ) : (
                <div>
                    <p style={{ fontSize: '14px', color: '#555', marginBottom: '15px', lineHeight: '1.4', textAlign: 'center' }}>A secure 6-digit access code has been dispatched. Please check your mobile lock screen text notifications.</p>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Secure Verification Token</label>
                        <input type="text" maxLength="6" placeholder="000000" required style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px', fontSize: '20px', letterSpacing: '4px', textAlign: 'center' }} value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} />
                    </div>
                    <button type="button" onClick={handleActionSubmit} style={{ width: '100%', padding: '10px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>Verify Secure Token Code</button>
                </div>
            )}

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '15px', fontSize: '13px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                {view !== 'login' ? (
                    <span style={{ color: '#0070f3', cursor: 'pointer', textDecoration: 'underline', fontWeight: '500' }} onClick={() => handleNavigationSwitch('login')}>Back to Sign In Form</span>
                ) : (
                    <span style={{ color: '#0070f3', cursor: 'pointer', textDecoration: 'underline', fontWeight: '500' }} onClick={() => handleNavigationSwitch('register')}>Create an Account / Register</span>
                )}
            </div>
        </div>
    );
}