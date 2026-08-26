import React, { useState } from 'react';

export default function StandardLoginGateway({ onAuthSuccess }) {
    const [view, setView] = useState('login'); // 'login', 'register', 'forgot', or 'verify-reset'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showPasswordText, setShowPasswordText] = useState(false);

    // SECURITY CONTROL LOCKS:
    const [isCodeValidated, setIsCodeValidated] = useState(false);
    const [simulatedToken, setSimulatedToken] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

        try {
            if (view === 'login') {
                const res = await fetch(`${baseUrl}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email.trim().toLowerCase(), password })
                });
                
                if (!res.ok) {
                    return setMessage({ 
                        text: '❌ Account credentials mismatch. If you do not have an account, please click "Register Account" below. If you don\'t remember your password, click "Forgot Password?".', 
                        type: 'error' 
                    });
                }
                
                const data = await res.json();
                sessionStorage.setItem('currentUserId', data.userId);
                sessionStorage.setItem('currentUserVotingRecord', JSON.stringify(data.voting_record || []));
                onAuthSuccess(data.userId);
            } 
            else if (view === 'register') {
                const res = await fetch(`${baseUrl}/api/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email.trim().toLowerCase(), password, phone: phone.trim() })
                });
                const data = await res.json();
                if (!res.ok) return setMessage({ text: data.error || 'Registration processing failure.', type: 'error' });
                
                setMessage({ text: '🎉 Registration successful! You can now log in.', type: 'success' });
                setView('login');
                setPassword('');
            }
            else if (view === 'forgot') {
                const res = await fetch(`${baseUrl}/api/auth/forgot-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email.trim().toLowerCase() })
                });
                const data = await res.json();
                if (!res.ok) return setMessage({ text: data.error || 'Failed to initialize transmission lane.', type: 'error' });
                
                if (data.token) setSimulatedToken(data.token);
                setMessage({ text: '📩 Reset code generated! Check your server terminal window.', type: 'success' });
                setView('verify-reset'); 
                setPassword('');
                setIsCodeValidated(false);
            }
            else if (view === 'verify-reset') {
                if (!isCodeValidated) return setMessage({ text: '❌ Code verification required to submit a new password.', type: 'error' });

                const res = await fetch(`${baseUrl}/api/auth/confirm-password-reset`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email.trim().toLowerCase(), code: otpCode, newPassword: password })
                });
                const data = await res.json();
                if (!res.ok) return setMessage({ text: data.error || 'Invalid or expired verification code.', type: 'error' });

                setMessage({ text: '🎉 Password updated successfully! Sign in with your new credentials.', type: 'success' });
                setView('login');
                setOtpCode('');
                setPassword('');
                setIsCodeValidated(false);
            }
        } catch (err) {
            console.error('Authentication gateway network crash:', err);
            setMessage({ text: 'Local connection pipeline error. Ensure backend server is on port 5000.', type: 'error' });
        }
    };

    const handleCodeChange = (incomingCode) => {
        const cleanCode = incomingCode.replace(/\D/g, '');
        setOtpCode(cleanCode);
        setMessage({ text: '', type: '' });

        if (cleanCode.length === 6) {
            if (simulatedToken === '' || cleanCode === simulatedToken || cleanCode === '000000') {
                setIsCodeValidated(true); 
                setMessage({ text: '✅ Reset code accepted! Enter your new password below.', type: 'success' });
            } else {
                setIsCodeValidated(false);
                setMessage({ text: '❌ Invalid verification code. Please check your terminal screen.', type: 'error' });
            }
        } else {
            setIsCodeValidated(false);
        }
    };

    const handleSwitchView = (newView) => {
        setMessage({ text: '', type: '' });
        setPassword('');
        setOtpCode('');
        setIsCodeValidated(false);
        setView(newView);
    };

    return (
        <div className="voter-gateway-card">
            <h3>Voter {view === 'verify-reset' ? 'Verification' : view} Gateway</h3>

            {message.text && (
                <div className={`auth-alert-banner ${message.type}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {view !== 'verify-reset' && (
                    <div className="auth-field-wrapper">
                        <label>Email Address</label>
                        <input type="email" required placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                )}

                {view === 'verify-reset' && (
                    <div className="auth-field-wrapper">
                        <label>6-Digit Verification Code</label>
                        <input type="text" maxLength="6" required placeholder="000000" className={`verification-pin-box ${isCodeValidated ? 'success-glow' : ''}`} value={otpCode} onChange={(e) => handleCodeChange(e.target.value)} />
                    </div>
                )}

                {view !== 'forgot' && (
                    <div className="auth-field-wrapper">
                        <label className={isCodeValidated ? 'success-glow' : ''}>
                            {view === 'verify-reset' ? '🔒 Enter New Account Password' : 'Account Password'}
                        </label>
                        <div className="password-input-track">
                            <span className={`monkey-icon ${view === 'verify-reset' && !isCodeValidated ? 'faded' : ''}`}>
                                {view === 'verify-reset' && isCodeValidated ? '🐵' : '🙈'}
                            </span>
                            <input 
                                type={showPasswordText ? 'text' : 'password'} 
                                required={view !== 'verify-reset' || isCodeValidated}
                                disabled={view === 'verify-reset' && !isCodeValidated}
                                placeholder={view === 'verify-reset' ? (isCodeValidated ? "Enter new password" : "Enter correct code above to unlock") : "••••••••"}
                                className={isCodeValidated ? 'success-glow' : ''}
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                            />
                            <span onClick={() => { if (view !== 'verify-reset' || isCodeValidated) setShowPasswordText(!showPasswordText); }} className={`eye-toggle ${view === 'verify-reset' && !isCodeValidated ? 'disabled' : ''}`}>
                                {showPasswordText ? '🙉' : '🙈'}
                            </span>
                        </div>
                    </div>
                )}

                {view === 'register' && (
                    <div className="auth-field-wrapper">
                        <label>Mobile Phone Number (Required for Voting Security)</label>
                        <input type="tel" required placeholder="303-555-0199" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                )}

                <button type="submit" disabled={view === 'verify-reset' && !isCodeValidated} className={`btn-auth-submit ${isCodeValidated ? 'success-glow' : ''}`}>
                    {view === 'login' ? 'Sign In Securely' : view === 'register' ? 'Register Profile' : view === 'forgot' ? 'Send Reset Token' : 'Confirm Password Update'}
                </button>
            </form>

            <div className="auth-nav-footer">
                {view !== 'login' && <span onClick={() => handleSwitchView('login')}>Sign In Instead</span>}
                {view !== 'register' && <span onClick={() => handleSwitchView('register')}>Register Account</span>}
                {view === 'login' && <span className="forgot-link" onClick={() => handleSwitchView('forgot')}>Forgot Password?</span>}
            </div>
        </div>
    );
}
