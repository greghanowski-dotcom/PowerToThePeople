import { useState } from 'react';

export default function ConsensusModal({ onClose }) {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h4>Current Consensus Stats</h4>
        
        <div style={{ marginBottom: '15px' }}>
          <p><strong>Strongly Agree:</strong> <span>34%</span></p>
          <p><strong>Somewhat Agree:</strong> <span>22%</span></p>
          <p><strong>Neutral:</strong> <span>14%</span></p>
          <p><strong>Somewhat Disagree:</strong> <span>18%</span></p>
          <p><strong>Strongly Disagree:</strong> <span>12%</span></p>
        </div>

        <hr style={{ margin: '15px 0' }} />

        <h5>Filter by Demographics</h5>
        <div className="demographic-filters">
          <div className="filter-row">
            <label>
              <input 
                type="radio" name="scopeOpt" value="overall" 
                defaultChecked 
                onChange={() => setShowDemo(false)} 
              /> Overall
            </label>
            <label>
              <input 
                type="radio" name="scopeOpt" value="by-demo" 
                onChange={() => setShowDemo(true)} 
              /> By Demographics
            </label>
          </div>

          {/* Demographic Rows - Only visible if 'showDemo' is true */}
          {showDemo && (
            <div className="demo-options">
              <div className="filter-row">
                <span className="row-label">Party:</span>
                <label><input type="radio" name="partyOpt" value="democrat" /> Dem</label>
                <label><input type="radio" name="partyOpt" value="republican" /> Rep</label>
              </div>
              <div className="filter-row">
                <span className="row-label">Age:</span>
                <label><input type="radio" name="ageOpt" value="18-24" /> 18-24</label>
                <label><input type="radio" name="ageOpt" value="25-34" /> 25-34</label>
              </div>
            </div>
          )}
        </div>

        <div className="modal-buttons" style={{ marginTop: '20px' }}>
          <button className="btn-close" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}