import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Polls from './pages/Polls';
import Ideas from './pages/Ideas';
import News from './pages/News';
import About from './pages/About';
import DynamicContentPage from './pages/DynamicContentPage';
import DiscussionModal from './components/modals/DiscussionModal';
import ConsensusModal from './components/modals/ConsensusModal';
import ProfileModal from './components/modals/ProfileModal';
import VoteModal from './components/modals/VoteModal';
import AccountModal from './components/modals/AccountModal';
import PreferencesModal from './components/modals/PreferencesModal';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'profile', 'discussion', etc.
  const [openPanels, setOpenPanels] = useState([]);
  const [keepAccordionsOpen, setKeepAccordionsOpen] = useState(false); // This will be controlled by PreferencesModal
  const [preferences, setPreferences] = useState({
    keepAccordionsOpen: true,
    notifications: true
  });
  // Inside your main App component:
  const [votes, setVotes] = useState({});

  useEffect(() => {
    // 1. Check if the returning user has an active voting record string saved in browser memory
    const storedVotingRecord = sessionStorage.getItem('currentUserVotingRecord');

    if (isLoggedIn && storedVotingRecord) {
      try {
        // 2. Translate the MySQL string database snapshot back into a usable JavaScript array layout
        const votingHistory = JSON.parse(storedVotingRecord);

        // 3. Use plain JavaScript reduce to turn the flat history list into a mapped React tracking layout
        const initializedVotes = votingHistory.reduce((acc, currentVote) => {
          // Extract your table data attributes
          const issueId = currentVote.issue_id;
          const voteType = currentVote.vote; // e.g., 'up' or 'down'

          acc[issueId] = {
            up: voteType === 'up' ? 1 : 0,
            down: voteType === 'down' ? 1 : 0,
            hasVoted: true // FIXED: This locks the button state on screen initialization
          };

          return acc;
        }, {});

        // 4. Hydrate your state engine with your true historical records
        setVotes(initializedVotes);

      } catch (error) {
        console.error("Failed to parse loaded database voting records:", error);
      }
    } else if (!isLoggedIn) {
      // Optional Safety: Clear out button tracking states if they choose to log out
      setVotes({});
    }
  }, [isLoggedIn]); // Fires automatically whenever the user flips their 'isLoggedIn' state token!

  console.log("App.jsx", { isLoggedIn, activeModal, openPanels, keepAccordionsOpen, preferences });
  const togglePanel = (panelId) => {
    if (keepAccordionsOpen) {
      // Multi-open logic
      setOpenPanels(prev =>
        prev.includes(panelId)
          ? prev.filter(id => id !== panelId)
          : [...prev, panelId]
      );
    } else {
      // Single-open logic
      setOpenPanels(prev =>
        prev.includes(panelId) ? [] : [panelId]
      );
    }
  };

  return (
    <div className="app-container">
      <Header
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        openModal={setActiveModal}
      />

      <main className="content-area">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/polls" element={<Polls />} />
          <Route 
  path="/ideas" 
  element={<Ideas keepAccordionsOpen={preferences.keepAccordionsOpen} isLoggedIn={isLoggedIn} />} 
/>
          <Route path="/news" element={<News />} />
          <Route path="/about" element={<About />} />
          <Route path="/details/:slug" element={<DynamicContentPage />} />
        </Routes>
      </main>

      {/* Modal Manager */}
      {activeModal === 'profile' && (
        <ProfileModal
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'account' && (
        <AccountModal
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'vote' && <VoteModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'consensus' && <ConsensusModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'preferences' && (
        <PreferencesModal
          prefs={preferences}
          setPrefs={setPreferences}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}