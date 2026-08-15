import React, { useState } from 'react';

export default function ResetPasswordModal({ isOpen, onClose }) {
    const [view, setView] = useState('request'); // 'request', 'verify'
    const [email, setEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    const [errorMsg, setErrorMessage] = useState('');
    const [successMsg, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const getBaseUrl = () => {
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            return 'http://localhost:5000';
        }
        return '';
    };

    const handleResetActionSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        setIsLoading(true);

        try {
            if (view === 'request') {
                // Phase 1: Request an outbound 2FA reset pin code token link via backend SMS
                const res = await fetch(`${getBaseUrl()}/api/auth/request-reset`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email.trim().toLowerCase() })
                });
                const data = await res.json();

                if (!res.ok || data.error) {
                    setErrorMessage(data.error || 'Failed to dispatch reset token code.');
                    return;
                }

                setSuccessMessage('🎉 Reset code texted to your screen layout bounds successfully!');
                setView('verify');
            } else if (view === 'verify') {
                // Phase 2: Verify the security token code and commit the long bcrypt hash string
                const res = await fetch(`${getBaseUrl()}/api/auth/confirm-reset`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: email.trim().toLowerCase(),
                        token: otpCode,
                        newPassword: newPassword
                    })
                });
                const data = await res.json();

                if (!res.ok || data.error) {
                    setErrorMessage(data.error || 'Token validation mismatch or password error.');
                    return;
                }

                alert('🎉 Password parameters re-routed and synchronized successfully!');
                onClose();
            }
        } catch (err) {
            setErrorMessage('Network transmission pipeline failure. Transaction aborted.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999999999 }}>
            <div className="modal-content" style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '10px', maxWidth: '400px', width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.25)', fontFamily: 'sans-serif' }}>
                <h3 style={{ margin: '0 0 20px 0', textAlign: 'center', color: '#1e3a8a' }}>🔐 Account Password Recovery</h3>

                {errorMsg && <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '4px', marginBottom: '15px', fontSize: '13px', border: '1px solid #fca5a5' }}>{errorMsg}</div>}
                {successMsg && <div style={{ padding: '10px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '4px', marginBottom: '15px', fontSize: '13px', border: '1px solid #a7f3d0' }}>{successMsg}</div>}

                <form onSubmit={handleResetActionSubmit}>
                    {view === 'request' ? (
                        <div className="form-group">
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px', fontSize: '14px' }}>Registered Account Email Address</label>
                            <input type="email" required placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
                        </div>
                    ) : (
                        <>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px', fontSize: '14px' }}>6-Digit Verification Code</label>
                                <input type="text" maxLength="6" required placeholder="000000" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box', textAlign: 'center', fontSize: '18px', letterSpacing: '2px' }} />
                            </div>
                            <div className="form-group">
                                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px', fontSize: '14px' }}>Enter New Password</label>
                                <input type="password" required placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
                            </div>
                        </>
                    )}

                    <div className="modal-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                        <button type="button" className="btn-close" onClick={onClose} disabled={isLoading} style={{ padding: '10px 16px', backgroundColor: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                        <button type="submit" className="btn-save" disabled={isLoading} style={{ padding: '10px 16px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                            {isLoading ? 'Processing...' : view === 'request' ? 'Send Reset Token' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
