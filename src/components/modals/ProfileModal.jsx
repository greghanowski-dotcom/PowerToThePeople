import { useState } from 'react';
import './ProfileModal.css';

export default function ProfileModal({ onClose }) { 
  const [formData, setFormData] = useState({ 
    email: '', 
    gender: '', 
    party: '',  
    zip: '', 
    age: ''     
  });
  
  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    try {
      const response = await fetch('http://127.0.0.1:5000/api/save_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), // Sends email, gender, age, party, zip cleanly
      });

      const data = await response.json();

      if (response.ok) {
        alert(`🎉 Success! Record saved to MySQL with User ID: ${data.userId}`);
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
            <label>Password</label>
            <input type="password" name="password" value={formData.password} placeholder="••••••••" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" name="phone" value={formData.phone} placeholder="(123) 456-7890" onChange={handleChange} />
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
            <input type="text" name="zip" value={formData.zip} placeholder="90210" onChange={handleChange} />
          </div>

          <div className="modal-buttons" style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-save">Save Changes</button>
            <button type="button" className="btn-close" onClick={onClose}>Cancel</button>
          </div>

        </form>
      </div>
    </div>
  );
}