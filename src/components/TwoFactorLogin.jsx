import React, { useState } from 'react';

export default function TwoFactorLogin({ onAuthSuccess, apiBaseUrl = '/api' }) {
    // Structural state management
    const [step, setStep] = useState(1); // Step 1: Login, Step 2: SMS 2FA
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [userId, setUserId] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // PHASE 1: STANDARD PRIMARY AUTHENTICATION
    const handlePrimaryLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');

        try {
            const response = await fetch(`${apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Login failed');

            setUserId(data.user.id);

            // Trigger the background 2FA transmission routine
            await handleTriggerSMS(data.user.id);
        } catch (err) {
            setErrorMessage(err.message);
        } finally {
            setLoading(false);
        }
    };

    // PHASE 2: SMS TRANSMISSION DISPATCHER
    const handleTriggerSMS = async (id) => {
        try {
            // Prompt user for phone number if not stored, otherwise backend handles it
            const targetPhone = phone || prompt("Enter your mobile number for 2FA verification:");
            if (!targetPhone) throw new Error('Phone number is required for account security verification');
            setPhone(targetPhone);

            const response = await fetch(`${apiBaseUrl}/auth/send-2fa`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: id, phone: targetPhone }),
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Failed to dispatch 2FA code');

            // Shift form layout grid row view directly over to code verification viewport
            setStep(2);
        } catch (err) {
            setErrorMessage(err.message);
        }
    };

    // PHASE 3: SECURE CODE & COOKIE DEVICE LOCKOUT VALIDATION
    const handleVerify2FA = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');

        try {
            const response = await fetch(`${apiBaseUrl}/auth/verify-2fa`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, code: twoFactorCode }),
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Invalid security validation token');

            // Success! Inform the master app layout context to pass down core user state parameters
            alert('Device fully authenticated and locked successfully!');
            onAuthSuccess(userId);
        } catch (err) {
            setErrorMessage(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2 style={{ textAlign: 'center' }}>Voter Access Control</h2>
            
            {errorMessage && (
                <div style={{ color: 'red', backgroundColor: '#fee', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
                    <strong>Security Alert:</strong> {errorMessage}
                </div>
            )}

            {step === 1 ? (
                /* STEP 1: EMAIL & PASSWORD LAYOUT FORM BLOCK */
                <form onSubmit={handlePrimaryLogin}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Email Address</label>
                        <input type="email" required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
                        <input type="password" required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        {loading ? 'Processing Authentication...' : 'Verify Credentials'}
                    </button>
                </form>
            ) : (
                /* STEP 2: 6-DIGIT SMS VERIFICATION COMPONENT OVERLAY */
                <form onSubmit={handleVerify2FA}>
                    <p style={{ fontSize: '14px', color: '#555', marginBottom: '15px' }}>
                        A secure 6-digit verification code has been dispatched to <strong>{phone}</strong>. Enter the validation string below to lock this device profile.
                    </p>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>SMS Security Code</label>
                        <input type="text" maxLength="6" required placeholder="000000" style={{ width: '100%', padding: '12px', boxSizing: 'border-box', textAlign: 'center', fontSize: '20px', letterSpacing: '4px' }} value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} />
                    </div>
                    <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        {loading ? 'Verifying Hardware footprint...' : 'Complete Device Authorization'}
                    </button>
                    <button type="button" onClick={() => handleTriggerSMS(userId)} style={{ width: '100%', marginTop: '10px', padding: '8px', backgroundColor: 'transparent', color: '#0070f3', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
                        Resend Code
                    </button>
                </form>
            )}
        </div>
    );
}
