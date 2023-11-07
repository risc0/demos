import { FC, ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

const Modal: FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        {title && <h4 className="modal-title">{title}</h4>}
        <div className="modal-content">{children}</div>
        <button className="modal-close" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};


export default Modal;
