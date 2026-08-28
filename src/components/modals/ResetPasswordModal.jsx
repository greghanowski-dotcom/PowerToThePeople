import React, { useState } from 'react';

export default function StandardLoginGateway({ onAuthSuccess }) {
    const [view, setView] = useState('login'); // 'login', 'registration', 'forgot', or 'verify-reset'
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
            else if (view === 'registration') {
                const res = await fetch(`${baseUrl}/api/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email.trim().toLowerCase(), password, phone: phone.trim() })
                });
                const data = await res.json();

                if (!res.ok) {
                    return setMessage({ text: data.error || 'Registration processing failure.', type: 'error' });
                }

                setMessage({ text: 'Registration successful! You can now log in.', type: 'success' });
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

                if (!res.ok) {
                    return setMessage({ text: data.error || 'Failed to initialize transmission lane.', type: 'error' });
                }

                if (data.token) setSimulatedToken(data.token);

                setMessage({ text: '📩 Reset code generated! Check your server terminal window.', type: 'success' });
                setView('verify-reset');
                setPassword('');
                setIsCodeValidated(false);
            }
            else if (view === 'verify-reset') {
                if (!isCodeValidated) {
                    return setMessage({ text: '❌ Code verification required to submit a new password.', type: 'error' });
                }

                const res = await fetch(`${baseUrl}/api/auth/confirm-password-reset`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email.trim().toLowerCase(), code: otpCode, newPassword: password })
                });
                const data = await res.json();

                if (!res.ok) {
                    return setMessage({ text: data.error || 'Invalid or expired verification code.', type: 'error' });
                }

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
        <div style={{ maxWidth: '380px', width: '100%', padding: '20px', background: '#fff', borderRadius: '8px', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
            <h3 style={{ textAlign: 'center', margin: '0 0 20px 0', textTransform: 'capitalize', color: '#1e3a8a', fontSize: '20px' }}>
                Voter {view === 'verify-reset' ? 'Verification' : 'Registration'}
            </h3>

            {message.text && (
                <div style={{ textAlign: 'center', padding: '10px', marginBottom: '15px', borderRadius: '4px', fontSize: '13px', lineHeight: '1.4', backgroundColor: message.type === 'error' ? '#fee2e2' : '#d1fae5', color: message.type === 'error' ? '#991b1b' : '#065f46', border: message.type === 'error' ? '1px solid #fca5a5' : '1px solid #a7f3d0', boxSizing: 'border-box' }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ width: '100%', boxSizing: 'border-box' }}>
                {/* 1. UNIVERSAL EMAIL ADDRESS INPUT BLOCK */}
                {view !== 'verify-reset' && (
                    <div style={{ marginBottom: '15px', width: '100%', boxSizing: 'border-box' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '13px', color: '#334155' }}>Email Address</label>
                        <input type="email" required placeholder="name@example.com" style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                )}

                {/* 2. 6-DIGIT SECURITY CODE SUBMISSION ROW */}
                {view === 'verify-reset' && (
                    <div style={{ marginBottom: '15px', width: '100%', boxSizing: 'border-box' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '13px', color: '#334155' }}>6-Digit Verification Code</label>
                        <input
                            type="text"
                            maxLength="6"
                            required
                            placeholder="000000"
                            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: isCodeValidated ? '2px solid #10b981' : '2px solid #0070f3', borderRadius: '6px', textAlign: 'center', fontSize: '18px', letterSpacing: '4px', fontWeight: 'bold', backgroundColor: '#f8fafc', transition: 'all 0.2s' }}
                            value={otpCode}
                            onChange={(e) => handleCodeChange(e.target.value)}
                        />
                    </div>
                )}

                {/* 3. PASSWORD CONTAINER BLOCK (LEFT JUSTIFIED & EYE INDICATORS) */}
                {view !== 'forgot' && (
                    <div style={{ marginBottom: '15px', width: '100%', boxSizing: 'border-box' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', fontSize: '13px', color: '#334155' }}>
                            {view === 'verify-reset' ? '🔒 Enter New Account Password' : 'Account Password'}
                        </label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>

                            {/* 👁️ THE ACTIVE SECURITY EYE STATUS CHIP INDICATION */}
                            <span style={{ position: 'absolute', left: '12px', fontSize: '16px', zIndex: 10, userSelect: 'none', opacity: (view === 'verify-reset' && !isCodeValidated) ? 0.4 : 1 }}>
                                {view === 'verify-reset' && isCodeValidated ? '🙉' : '🙈'} {/* 🚀 FIXED: Swaps closed eye to open eye natively! */}
                            </span>

                            <input
                                type={showPasswordText ? 'text' : 'password'}
                                required={view !== 'verify-reset' || isCodeValidated}
                                disabled={view === 'verify-reset' && !isCodeValidated}
                                placeholder={view === 'verify-reset' ? (isCodeValidated ? "Enter new password" : "Enter correct code above to unlock") : "••••••••"}
                                style={{
                                    width: '100%',
                                    padding: '10px 40px 10px 36px',
                                    boxSizing: 'border-box',
                                    border: isCodeValidated ? '2px solid #10b981' : '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    textAlign: 'left',
                                    backgroundColor: (view === 'verify-reset' && !isCodeValidated) ? '#f3f4f6' : '#ffffff',
                                    cursor: (view === 'verify-reset' && !isCodeValidated) ? 'not-allowed' : 'text',
                                    transition: 'all 0.2s'
                                }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <span
                                onClick={() => { if (view !== 'verify-reset' || isCodeValidated) setShowPasswordText(!showPasswordText); }}
                                style={{ position: 'absolute', right: '12px', cursor: (view === 'verify-reset' && !isCodeValidated) ? 'not-allowed' : 'pointer', fontSize: '16px', userSelect: 'none', opacity: (view === 'verify-reset' && !isCodeValidated) ? 0.3 : 1, zIndex: 11 }}
                            >
                                {showPasswordText ? '🙉' : '🙈'}
                            </span>
                        </div>
                    </div>
                )}

                {/* 4. MOBILE PHONE NUMBER FIELD */}
                {view === 'registration' && (
                    <div style={{ marginBottom: '15px', width: '100%', boxSizing: 'border-box' }}>
                        {/* 1. Added display: flex and justify-content: space-between to the label */}
                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            Mobile Phone Number

                            {/* 2. Cleaned up the span styles so it handles the tooltip naturally */}
                            <span className='tooltipContainer' data-tooltip="Optional, but needed for voting so that no one can try to manipulate the system.">
                                ❓
                            </span>
                        </label>
                        <input type="tel" required placeholder="123-456-7890" style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={view === 'verify-reset' && !isCodeValidated}
                    style={{
                        width: '100%',
                        padding: '11px',
                        backgroundColor: (view === 'verify-reset' && !isCodeValidated) ? '#cbd5e1' : isCodeValidated ? '#10b981' : '#0070f3',
                        color: (view === 'verify-reset' && !isCodeValidated) ? '#64748b' : '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        cursor: (view === 'verify-reset' && !isCodeValidated) ? 'not-allowed' : 'pointer',
                        fontSize: '15px',
                        marginTop: '10px',
                        boxShadow: '0 2px 4px rgba(0,112,243,0.2)',
                        transition: 'all 0.2s',
                        boxSizing: 'border-box'
                    }}
                >
                    {view === 'login' ? 'Sign In Securely' : view === 'registration' ? 'Register Profile' : view === 'forgot' ? 'Send Reset Token' : 'Confirm Password Update'}
                </button>
            </form>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderTop: '1px solid #f1f5f9', paddingTop: '15px', boxSizing: 'border-box' }}>
                {view !== 'login' && <span style={{ color: '#0070f3', cursor: 'pointer', fontWeight: '500', textDecoration: 'underline' }} onClick={() => handleSwitchView('login')}>Sign In Instead</span>}
                {view !== 'registration' && <span style={{ color: '#0070f3', cursor: 'pointer', fontWeight: '500', textDecoration: 'underline' }} onClick={() => handleSwitchView('registration')}>Register Account</span>}
                {view === 'login' && <span style={{ color: '#64748b', cursor: 'pointer', fontWeight: '500', textDecoration: 'underline' }} onClick={() => handleSwitchView('forgot')}>Forgot Password?</span>}
            </div>
        </div>
    );
}
