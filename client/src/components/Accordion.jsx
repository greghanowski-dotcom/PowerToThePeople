import { useState } from 'react';
import './Accordion.css';

export default function Accordion({ items, renderContent }) {
  // Keeps track of the index of the currently open panel
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="accordion">
      {items.map((item, idx) => (
        <div key={idx} className="accordion-item">
          <button 
            className="accordion-header" 
            onClick={() => toggle(idx)}
          >
            {item.title} 
            <span>{openIndex === idx ? '−' : '+'}</span>
          </button>
          
          {openIndex === idx && (
            <div className="accordion-content">
              {/* This executes the logic passed from the parent (e.g., Ideas.jsx) */}
              {renderContent(item)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}