import React, { useState, useEffect } from "react";
import { PromptModalProps } from "../type";
import "./PromptModal.css";
import Button from "./Button";

const PromptModal: React.FC<PromptModalProps> = ({
  open,
  title = "Введите значение",
  message,
  placeholder = "",
  confirmText = "ОК",
  cancelText = "Отмена",
  onConfirm,
  onCancel,
}) => {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (open) setValue("");
  }, [open]);

  if (!open) return null;

  return (
    <div className="confirm-backdrop">
      <div className="confirm-modal">
        {title && <h2>{title}</h2>}
        {message && <p>{message}</p>}
        <input
          type="text"
          className="prompt-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
        />
        <div className="confirmprompt-buttons">
          <Button onClick={onCancel}>{cancelText}</Button>
          <Button styled={{ minWidth: "70px" }} className="button_btn--red-hover" onClick={() => onConfirm(value)}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PromptModal;
