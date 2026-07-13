import { useState } from 'react';
import './Preferences.css';

export default function PreferencesModal({ onClose }) {
  // In a real app, these values would likely come from a context or global state
  const [prefs, setPrefs] = useState({
    keepAccordionsOpen: false,
    notifications: true,
  });

  const handleToggle = (name) => {
    setPrefs((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSave = () => {
    console.log('Saving preferences:', prefs);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', textAlign: 'center' }}>
          Preferences
        </h3>

        {/* Preference Row: Accordions */}
        <div className="preference-row">
          <input
            type="checkbox"
            id="accordion-toggle"
            checked={prefs.keepAccordionsOpen}
            onChange={() => handleToggle('keepAccordionsOpen')}
          />
          <label htmlFor="accordion-toggle">Accordion panels stay open</label>
        </div>

        {/* Preference Row: Notifications */}
        <div className="preference-row">
          <input
            type="checkbox"
            id="notification-toggle"
            checked={prefs.notifications}
            onChange={() => handleToggle('notifications')}
          />
          <label htmlFor="notification-toggle">Enable Notifications</label>
        </div>

        <div className="modal-buttons">
          <button className="btn-save" onClick={handleSave}>
            Save Preferences
          </button>
          <button className="btn-close" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}