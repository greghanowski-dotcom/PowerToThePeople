export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h4>{title}</h4>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};