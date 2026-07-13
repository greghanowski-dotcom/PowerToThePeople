import { useState } from 'react';
import './ProfileModal.css';

export default function ProfileModal({ onClose }) {
    const [formData, setFormData] = useState({
        email: '', gender: '', party: '', zip: '', age: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>My Profile</h3>

                <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" name="email" placeholder="user@example.com" onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange}>
                        <option value="" disabled>Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>
                
                <div className="form-group">
                    <label>Age</label>
                    <select name="age" value={formData.age} onChange={handleChange}>
                        <option value="" disabled>Select Age</option>
                        <option value="18-24">18-24</option>
                        <option value="25-34">25-34</option>
                        <option value="35-50">35-50</option>
                        <option value="50+">50+</option>
                    </select>
                </div>


                <div className="form-group">
                    <label>Party Affiliation</label>
                    <select name="party" value={formData.party} onChange={handleChange}>
                        <option value="" disabled>Select Party</option>
                        <option value="Democrat">Democrat</option>
                        <option value="Republican">Republican</option>
                        <option value="Independent">Independent</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Zip Code</label>
                    <input type="text" name="zip" placeholder="90210" onChange={handleChange} />
                </div>

                <div className="modal-buttons">
                    <button className="btn-close" onClick={onClose}>Cancel</button>
                    <button className="btn-save" onClick={onClose}>Save Changes</button>
                </div>
            </div>
        </div>
    );
}