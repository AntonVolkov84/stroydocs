import React from "react";
import Button from "./Button";
import "./AlertModal.css";

interface AlertModalProps {
  open: boolean;
  message: string;
  title?: string;
  confirmText?: string;
  onConfirm: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ open, message, title, confirmText = "ОК", onConfirm }) => {
  if (!open) return null;

  return (
    <div className="confirm-backdrop">
      <div className="confirm-modal">
        {title && <h2>{title}</h2>}
        <p>{message}</p>
        <div className="confirm-buttons">
          <Button styled={{ minWidth: "70px" }} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
