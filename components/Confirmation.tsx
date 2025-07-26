import React from "react";
import { ConfirmModalProps } from "../type";
import "./Confirmation.css";
import Button from "./Button";

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title = "Подтверждение",
  message,
  confirmText = "ОК",
  cancelText = "Отмена",
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="confirm-backdrop">
      <div className="confirm-modal">
        {title && <h2>{title}</h2>}
        <p>{message}</p>
        <div className="confirm-buttons-conf">
          <Button styled={{ minWidth: "70px" }} onClick={onCancel}>
            {cancelText}
          </Button>
          <Button styled={{ minWidth: "70px" }} className="button_btn--red-hover" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
