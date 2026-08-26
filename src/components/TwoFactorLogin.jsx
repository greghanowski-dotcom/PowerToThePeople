import React, { useState } from 'react';

export default function VoterLoginGateway({ onAuthSuccess }) {
    const [view, setView] = useState('login'); // 'login', 'register', or 'forgot'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showPasswordText, setShowPasswordText] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        try {
            // STANDARD LOGIN PIPE
            if (view === 'login') {
                const res = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email.trim().toLowerCase(), password })
                });
                const data = await res.json();
                if (!res.ok) return setMessage({ text: data.error || 'Invalid credentials.', type: 'error' });
                
                // Success: Hydrate browser memory cache strings
                sessionStorage.setItem('currentUserVotingRecord', JSON.stringify(data.voting_record || []));
                onAuthSuccess(data.userId);
            } 
            // STANDARD REGISTRATION PIPE (Locks phone uniquely)
            else if (view === 'register') {
                const res = await fetch('http://localhost:5000/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email.trim(), password, phone: phone.trim() })
                });
                const data = await res.json();
                if (!res.ok) return setMessage({ text: data.error || 'Registration failed.', type: 'error' });
                
                setMessage({ text: '🎉 Registration successful! You can now log in.', type: 'success' });
                setView('login');
            }
            // STANDARD PASSWORD RESET PIPE
            else if (view === 'forgot') {
                const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email.trim() })
                });
                if (!res.ok) return setMessage({ text: 'Failed to send recovery email.', type: 'error' });
                
                setMessage({ text: '📩 If that account exists, a reset link has been dispatched!', type: 'success' });
            }
        } catch (err) {
            setMessage({ text: 'Connection failure. Please try again.', type: 'error' });
        }
    };

    return (
        <div style={{ maxWidth: '380px', width: '100%', padding: '30px', background: '#fff', borderRadius: '8px', fontFamily: 'sans-serif' }}>
            <h3 style={{ textAlign: 'center', margin: '0 0 20px 0', textTransform: 'capitalize', color: '#1e3a8a' }}>Voter {view} Gateway</h3>

            {message.text && (
                <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '4px', fontSize: '14px', backgroundColor: message.type === 'error' ? '#fee2e2' : '#d1fae5', color: message.type === 'error' ? '#991b1b' : '#065f46' }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>Email Address</label>
                    <input type="email" required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }} value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                {view !== 'forgot' && (
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>Password</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <span style={{ position: 'absolute', left: '10px', fontSize: '16px', zIndex: 10 }}>🙈</span>
                            <input 
                                type={showPasswordText ? 'text' : 'password'} 
                                required 
                                style={{ width: '100%', padding: '8px 8px 8px 34px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }} 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                            />
                        </div>
                    </div>
                )}

                {view === 'register' && (
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>Phone Number (For Ballot Security Check)</label>
                        <input type="tel" required placeholder="303-555-0199" style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }} value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                )}

                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', marginTop: '10px' }}>
                    Continue
                </button>
            </form>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                {view !== 'login' && <span style={{ color: '#0070f3', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setView('login')}>Sign In</span>}
                {view !== 'register' && <span style={{ color: '#0070f3', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setView('register')}>Register</span>}
                {view === 'login' && <span style={{ color: '#64748b', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setView('forgot')}>Forgot Password?</span>}
            </div>
        </div>
    );
}
