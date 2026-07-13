import { useState } from 'react';
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
          <Route path="/ideas" element={<Ideas keepAccordionsOpen={preferences.keepAccordionsOpen} />} />
          <Route path="/news" element={<News />} />
          <Route path="/about" element={<About />} />
          <Route path="/details/:slug" element={<DynamicContentPage />} />
        </Routes>
      </main>

      {/* Modal Manager */}
      {activeModal === 'profile' && <ProfileModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'vote' && <VoteModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'consensus' && <ConsensusModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'account' && <AccountModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'preferences' && (
        <PreferencesModal
          prefs={preferences}
          setPrefs={setPreferences}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'discussion' && (
        <DiscussionModal
          onClose={() => setActiveModal(null)}
          title="Universal Basic Income"
          argsFor="Provides a safety net, reduces poverty, and encourages entrepreneurship."
          argsAgainst="May lead to inflation, reduce work incentives, and is expensive to fund."
        />
      )}
    </div>
  );
}