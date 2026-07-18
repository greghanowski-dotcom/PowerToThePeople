import { useState } from 'react';
//import './AccountModal.css';

export default function AccountModal({ onClose }) {
  const [accountData, setAccountData] = useState({
    email: 'user@example.com',
    password: ''
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Account Settings</h3>
        
        <div className="form-group">
          <label>Email Address</label>
          <input 
            type="email" 
            value={accountData.email} 
            onChange={(e) => setAccountData({...accountData, email: e.target.value})} 
          />
        </div>

        <div className="form-group">
          <label>Reset Password</label>
          <input type="password" placeholder="New Password" />
        </div>

        <div className="modal-buttons">
          <button className="btn-save">Update Account</button>
          <button className="btn-close" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}