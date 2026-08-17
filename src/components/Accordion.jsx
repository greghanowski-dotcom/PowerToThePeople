// src/components/Accordion.jsx
import React, { useState } from 'react';

export default function Accordion({ items, renderContent, keepOpen = false }) {
  // 🚀 FIXED: Local self-managed state tracking handles open panels internally 
  const [openIndices, setOpenIndices] = useState([]);

  const togglePanel = (idx) => {
    if (openIndices.includes(idx)) {
      // If already open, close it by filtering it out of the array
      setOpenIndices(openIndices.filter(i => i !== idx));
    } else {
      // If closed, add it to the array. If keepOpen is false, close others first.
      setOpenIndices(keepOpen ? [...openIndices, idx] : [idx]);
    }
  };

  return (
    <div className="accordion">
      {items.map((item, idx) => {
        const isOpen = openIndices.includes(idx);
        
        return (
          <div key={idx} className="accordion-item">
            {/* 🚀 FIXED: Calls local togglePanel click handler string mappings */}
            <button
              type="button"
              className={`accordion-header ${isOpen ? 'active' : ''}`}
              onClick={() => togglePanel(idx)}
            >
              {item.title}
            </button>

            {/* 🚀 FIXED: The structural box vanishes from your page layout completely when closed,
                leaving absolutely zero empty space or structural layout gaps behind! */}
            {isOpen && (
              <div className="accordion-content">
                {renderContent(item)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
