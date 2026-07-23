import { useState } from 'react';
import './ProfileModal.css';

// 1. Destructured props cleanly at the entry gate
export default function ProfileModal({ onClose, setIsLoggedIn }) { 
  
  // 2. Initialized state variables cleanly so no inputs start as undefined
  const [formData, setFormData] = useState({ 
    email: sessionStorage.getItem('currentUserEmail') || '', 
    gender: sessionStorage.getItem('currentUserGender') || '', 
    party: sessionStorage.getItem('currentUserPartyAffiliation') || '',  
    zip_code: sessionStorage.getItem('currentUserZipCode') || '', 
    age: sessionStorage.getItem('currentUserAge') || ''     
  });
  
  // FIXED: Ensured this exact state hook is declared at the top of your component body
  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    try {
      // Direct POST request mapping your inputs straight to your port 5000 MySQL backend
      const response = await fetch('http://127.0.0.1:5000/api/save_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          gender: formData.gender,
          age: formData.age,
          party_affiliation: formData.party, 
          zip_code: formData.zip_code             
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Hydrate all database columns into frontend sessionStorage variables
        sessionStorage.setItem('currentUserId', data.userId);
        sessionStorage.setItem('currentUserEmail', formData.email);
        sessionStorage.setItem('currentUserGender', formData.gender);
        sessionStorage.setItem('currentUserAge', formData.age);
        sessionStorage.setItem('currentUserPartyAffiliation', formData.party);
        sessionStorage.setItem('currentUserZipCode', formData.zip_code);

        alert(`🎉 Success! Record saved to MySQL with User ID: ${data.userId}`);
        
        // Keeps your top navigation bar layout logged in safely instead of wiping memory!
        if (typeof setIsLoggedIn === 'function') {
          setIsLoggedIn(true); 
        }

        onClose(); 
      } else {
        setValidationError(data.details || data.error || "Something went wrong.");
      }
    } catch (error) {
      console.error("Database connection failure:", error);
      setValidationError("Failed to communicate with database server on port 5000.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>My Profile</h3>

        {/* FIXED POSITION: This safely resolves line 64 error because hook is in scope */}
        {validationError && (
          <div style={{ color: 'red', marginBottom: '15px', fontWeight: 'bold', textAlign: 'center' }}>
            ⚠️ {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email} placeholder="user@example.com" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="form-group">
            <label>Age</label>
            <select name="age" value={formData.age} onChange={handleChange}>
              <option value="">Select Age</option>
              <option value="18-24">18-24</option>
              <option value="25-34">25-34</option>
              <option value="35-50">35-50</option>
              <option value="50+">50+</option>
            </select>
          </div>

          <div className="form-group">
            <label>Party Affiliation</label>
            <select name="party" value={formData.party} onChange={handleChange}>
              <option value="">Select Party</option>
              <option value="Democrat">Democrat</option>
              <option value="Republican">Republican</option>
              <option value="Independent">Independent</option>
            </select>
          </div>

          <div className="form-group">
            <label>Zip Code</label>
            <input type="text" name="zip_code" value={formData.zip_code} placeholder="90210" onChange={handleChange} />
          </div>

          <div className="modal-buttons" style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-close" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save">Save Changes</button>
          </div>

        </form>
      </div>
    </div>
  );
}
