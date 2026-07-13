import { useState, useEffect } from 'react';
import './Accordion.css';

export default function Accordion({ items, renderContent, keepOpen = false}) {
  console.log('keepOpen prop is:', keepOpen);
  // Store an array of open indices instead of a single index
  const [openIndices, setOpenIndices] = useState([]);

// RESET logic: If keepOpen is turned off, collapse everything except the first one
  useEffect(() => {
    if (!keepOpen && openIndices.length > 1) {
      setOpenIndices([openIndices[0]]); 
    }
  }, [keepOpen]);

  const toggle = (index) => {
    if (keepOpen) {
      // MULTI-SELECT logic
      setOpenIndices((prev) =>
        prev.includes(index)
          ? prev.filter((idx) => idx !== index) // Close if already open
          : [...prev, index]                    // Add to open list
      );
    } else {
      // SINGLE-SELECT logic (original behavior)
      setOpenIndices((prev) => (prev.includes(index) ? [] : [index]));
    }
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
            <span>{openIndices.includes(idx) ? '−' : '+'}</span>
          </button>

          {openIndices.includes(idx) && (
            <div className="accordion-content">
              {renderContent(item)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}