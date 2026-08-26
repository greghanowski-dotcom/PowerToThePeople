import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TwoFactorLogin from './components/TwoFactorLogin';
import Header from './components/Header';
import Home from './pages/Home';
import Polls from './pages/Polls';
import Surveys from './pages/Surveys';
import News from './pages/News';
import About from './pages/About';
import DynamicContentPage from './pages/DynamicContentPage';
import ProfileModal from './components/modals/ProfileModal';
import AccountModal from './components/modals/AccountModal';
import PreferencesModal from './components/modals/PreferencesModal';
import StandardLoginGateway from './components/modals/StandardLoginGateway'; 

// Adaptive endpoint URL: uses local environment variables or falls back to production Nginx routes
const GLOBAL_API_URL = import.meta.env?.VITE_API_URL || '/api';

export default function App() {
    // Session states
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userId, setUserId] = useState(null);
    const [isAppLoading, setIsAppLoading] = useState(true);

    // Modal and accordion panel state configurations
    const [activeModal, setActiveModal] = useState(null);
    const [preferences, setPreferences] = useState({ keepAccordionsOpen: true, notifications: true });
    const [votes, setVotes] = useState({});

    // 1. DEVICE RECOGNITION TIMELINE CHECK [INDEX]
    useEffect(() => {
        const verifyExistingDeviceToken = () => {
            const token = localStorage.getItem('voter_token');
            const savedUid = localStorage.getItem('voter_uid');
            if (token && savedUid) {
                // Device recognized! Authorize the dashboard views instantly
                setUserId(savedUid);
                setIsLoggedIn(true);
            }
            setIsAppLoading(false);
        };
        verifyExistingDeviceToken();
    }, []);

    // 2. BACKEND DATABASE SNAPSHOT HYDRATION LOOP [INDEX]
    useEffect(() => {
        const storedVotingRecord = sessionStorage.getItem('currentUserVotingRecord');
        if (isLoggedIn && storedVotingRecord) {
            try {
                const votingHistory = JSON.parse(storedVotingRecord);
                if (Array.isArray(votingHistory)) {
                    // 🚀 FIXED: Dynamic parsing maps 5-point Likert scale positions [INDEX]
                    const initializedVotes = votingHistory.reduce((acc, currentVote) => {
                        const issueId = currentVote.issue_id;
                        const voteType = currentVote.vote; // 'Strongly Agree', 'Neutral', etc.

                        // Standardize string casing mapping key helper conversion
                        const internalKey = voteType.charAt(0).toLowerCase() + voteType.slice(1).replace(/\s+/g, '');

                        acc[issueId] = {
                            stronglyAgree: internalKey === 'stronglyAgree' ? 1 : 0,
                            somewhatAgree: internalKey === 'somewhatAgree' ? 1 : 0,
                            neutral: internalKey === 'neutral' ? 1 : 0,
                            somewhatDisagree: internalKey === 'somewhatDisagree' ? 1 : 0,
                            stronglyDisagree: internalKey === 'stronglyDisagree' ? 1 : 0,
                            hasVoted: true,
                            userChoice: voteType
                        };
                        return acc;
                    }, {});
                    setVotes(initializedVotes);
                }
            } catch (error) {
                console.error("Failed to parse loaded database voting records:", error);
            }
        } else if (!isLoggedIn) {
            setVotes({});
        }
    }, [isLoggedIn]);

    // 3. SECURE AUTHENTICATION RECOGNITION CALLBACK [INDEX]
    const handleAuthSuccess = (authenticatedUserId) => {
        localStorage.setItem('voter_token', 'secure-device-verified-token');
        localStorage.setItem('voter_uid', authenticatedUserId);
        setUserId(authenticatedUserId);
        setIsLoggedIn(true);
    };

    // 4. SECURE LOGOUT TERMINATION HANDLER [INDEX]
    const handleLogout = () => {
        localStorage.removeItem('voter_token');
        localStorage.removeItem('voter_uid');
        sessionStorage.removeItem('currentUserVotingRecord');
        setIsLoggedIn(false);
        setUserId(null);
        setActiveModal(null);
    };

    // Delay render if the device is currently analyzing its localStorage tokens [INDEX]
    if (isAppLoading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif', fontSize: '15px', color: '#475569' }}>
                ⏳ Verifying Device Identity Security...
            </div>
        );
    }


    /* ==========================================================================
       🏛️ RESPONSIVE APPLICATION SHELL ROUTING MATRIX & VIEW CANVAS
       ========================================================================== */
    return (
        <div className="app-container">

            {/* Universal Sticky Page Header Navigation */}
            <Header isLoggedIn={isLoggedIn} setIsLoggedIn={handleLogout} openModal={setActiveModal} />

            {/* Liquid Page Wrapper Container */}
            <main className="content-area">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/polls" element={<Polls />} />

                    {/* Passes down login status directly into your surveys container [INDEX] */}
                    <Route
                        path="/surveys"
                        element={<Surveys keepAccordionsOpen={preferences.keepAccordionsOpen} isLoggedIn={isLoggedIn} />}
                    />

                    <Route path="/news" element={<News />} />
                    <Route path="/about" element={<About />} />

                    {/* Dynamic full-screen policy article rendering route channel [INDEX] */}
                    <Route path="/details/:slug" element={<DynamicContentPage />} />

                    {/* Catch-all redirect keeps user navigation path safe [INDEX] */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>

            {/* ==========================================================================
         🖼️ GLOBAL MODAL OVERLAY MANAGER LAYER
         ========================================================================== */}
            {activeModal && (
                <div className="global-modal-manager">

                    {/* Authenticated 2FA gateway form login modal for guests [INDEX] */}
                    {/* 🎛️ REPLACED INSIDE APP.JSX WITHIN THE ACTIVE_MODAL GRID */}
                    {/* 🎛️ CLEAN OVERLAY CONTAINER INSIDE APP.JSX */}
                    {activeModal === 'auth-gate' && (
                        <div className="modal-overlay" onClick={() => setActiveModal(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999999 }}>
                            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: '#fff', padding: '10px', borderRadius: '10px', position: 'relative' }}>
                                <button
                                    className="close-btn"
                                    onClick={() => setActiveModal(null)}
                                    style={{ position: 'absolute', top: '12px', right: '16px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8', zIndex: 100 }}
                                >
                                    x
                                </button>
                                {/* 🚀 Clean, un-nested implementation mounting standard routes! */}
                                <StandardLoginGateway onAuthSuccess={(uid) => { handleAuthSuccess(uid); setActiveModal(null); }} />
                            </div>
                        </div>
                    )}



                    {activeModal === 'profile' && (
                        <ProfileModal isOpen={true} onClose={() => setActiveModal(null)} />
                    )}

                    {activeModal === 'account' && (
                        <AccountModal isOpen={true} onClose={() => setActiveModal(null)} />
                    )}

                    {activeModal === 'preferences' && (
                        <PreferencesModal prefs={preferences} setPrefs={setPreferences} onClose={() => setActiveModal(null)} />
                    )}

                </div>
            )}
        </div>
    );
}

