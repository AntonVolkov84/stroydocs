import "./Button.css";
import React from "react";

interface PersonalPageProps {
  children: React.ReactNode;
  onClick?: () => void;
  typeBtn?: "reset" | "button" | "submit";
  styled?: {};
  className?: string;
  disabled?: boolean;
}

function Button({
  children,
  onClick,
  typeBtn = "button",
  styled,
  className = "button_btn",
  disabled,
}: PersonalPageProps) {
  return (
    <button disabled={disabled} style={styled} type={typeBtn} className={`button_btn ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;
