export default function DiscussionModal({ onClose, title, argsFor, argsAgainst }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
        <h4 style={{ textAlign: 'center' }}>Discussion: {title}</h4>
        
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <h5>Arguments For</h5>
            <p style={{ color: '#475569' }}>{argsFor}</p>
          </div>
          <div style={{ flex: 1, borderLeft: '1px solid #e2e8f0', paddingLeft: '20px' }}>
            <h5>Arguments Against</h5>
            <p style={{ color: '#475569' }}>{argsAgainst}</p>
          </div>
        </div>
        
        <div className="modal-buttons" style={{ marginTop: '20px' }}>
          <button className="btn-close" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}