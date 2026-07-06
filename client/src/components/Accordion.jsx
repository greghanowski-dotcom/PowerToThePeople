import { useState } from 'react';
import './Accordion.css';

export const Accordion = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="accordion-item">
      <button className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
        {title}
      </button>
      <div className={`accordion-panel ${isOpen ? 'open' : ''}`}>
        <div className="panel-content" style={{ padding: '1rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
};