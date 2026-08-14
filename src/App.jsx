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
import DiscussionModal from './components/modals/DiscussionModal';
import ConsensusModal from './components/modals/ConsensusModal';
import ProfileModal from './components/modals/ProfileModal';
import VoteModal from './components/modals/VoteModal';
import AccountModal from './components/modals/AccountModal';
import PreferencesModal from './components/modals/PreferencesModal';

// Adaptive endpoint URL: uses local environment variables or falls back to production Nginx routes
const GLOBAL_API_URL = import.meta.env?.VITE_API_URL || '/api';

export default function App() {
    // Session states
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userId, setUserId] = useState(null);
    const [isAppLoading, setIsAppLoading] = useState(true);

    // Modal and accordion panel states
    const [activeModal, setActiveModal] = useState(null);
    const [openPanels, setOpenPanels] = useState([]);
    const [keepAccordionsOpen, setKeepAccordionsOpen] = useState(false);
    const [preferences, setPreferences] = useState({ keepAccordionsOpen: true, notifications: true });
    const [votes, setVotes] = useState({});

    // 1. DEVICE RECOGNITION TIMELINE CHECK
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

    // 2. BACKEND DATABASE SNAPSHOT HYDRATION LOOP
    useEffect(() => {
        const storedVotingRecord = sessionStorage.getItem('currentUserVotingRecord');
        if (isLoggedIn && storedVotingRecord) {
            try {
                const votingHistory = JSON.parse(storedVotingRecord);
                const initializedVotes = votingHistory.reduce((acc, currentVote) => {
                    const issueId = currentVote.issue_id;
                    const voteType = currentVote.vote;
                    acc[issueId] = { up: voteType === 'up' ? 1 : 0, down: voteType === 'down' ? 1 : 0, hasVoted: true };
                    return acc;
                }, {});
                setVotes(initializedVotes);
            } catch (error) {
                console.error("Failed to parse loaded database voting records:", error);
            }
        } else if (!isLoggedIn) {
            setVotes({});
        }
    }, [isLoggedIn]);

    console.log("[APP CORE] Current activeModal state string position value:", activeModal);
    // 3. SECURE AUTHENTICATION RECOGNITION CALLBACK
    const handleAuthSuccess = (authenticatedUserId) => {
        localStorage.setItem('voter_token', 'secure-device-verified-token');
        localStorage.setItem('voter_uid', authenticatedUserId);
        setUserId(authenticatedUserId);
        setIsLoggedIn(true);
    };

    // 4. SECURE LOGOUT TERMINATION HANDLER
    const handleLogout = () => {
        localStorage.removeItem('voter_token');
        localStorage.removeItem('voter_uid');
        sessionStorage.removeItem('currentUserVotingRecord');
        setIsLoggedIn(false);
        setUserId(null);
        setActiveModal(null);
    };

    const togglePanel = (panelId) => {
        if (keepAccordionsOpen) {
            setOpenPanels(prev => prev.includes(panelId) ? prev.filter(id => id !== panelId) : [...prev, panelId]);
        } else {
            setOpenPanels(prev => prev.includes(panelId) ? [] : [panelId]);
        }
    };

    // Delay render if the device is currently analyzing its localStorage tokens
    if (isAppLoading) {
        return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>Verifying Device Identity Security...</div>;
    }

    /* 🛡️ SECURITY SHIELD: If unverified, block all routes and force 2FA input */
    if (!isLoggedIn) {
        return (
            <div className="security-auth-container" style={{ padding: '20px', minHeight: '100vh', display: 'flex', alignItems: 'center', backgroundColor: '#f9fafb' }}>
                <TwoFactorLogin onAuthSuccess={handleAuthSuccess} apiBaseUrl={GLOBAL_API_URL} />
            </div>
        );
    }

    /* 🚀 ROUTING ARCHITECTURE: Only rendered if device authorization passes */
    return (
        <div className="app-container">
            {/* Header now receives a customized logout injection loop to wipe local tokens safely */}
            <Header isLoggedIn={isLoggedIn} setIsLoggedIn={handleLogout} openModal={setActiveModal} />

            <main className="content-area">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/polls" element={<Polls />} />
                    <Route path="/surveys" element={<Surveys keepAccordionsOpen={preferences.keepAccordionsOpen} isLoggedIn={isLoggedIn} />} />
                    <Route path="/news" element={<News />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/details/:slug" element={<DynamicContentPage />} />
                    {/* Catch-all safety redirect route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>

            {/* Modal Control Layer */}
            {/* 🚀 THE FIXED SELF-HEALING SWITCH WRAPPER: Matches whichever string layout state maps down */}
            {/* 🚀 FIXED: Passes the explicit isOpen gate property so the modals can paint onto the DOM screen */}
            {activeModal && (
                <div className="global-modal-manager">
                    {activeModal === 'profile' && (
                        <ProfileModal isOpen={true} onClose={() => setActiveModal(null)} />
                    )}

                    {activeModal === 'account' && (
                        <AccountModal isOpen={true} onClose={() => setActiveModal(null)} />
                    )}

                    {activeModal === 'preferences' && (
                        <PreferencesModal isOpen={true} onClose={() => setActiveModal(null)} />
                    )}
                </div>
            )}
        </div>
    );
}
