import React from "react";
import "./Input.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input: React.FC<InputProps> = ({ className = "", ...props }) => {
  return <input className={`custom-input ${className}`} {...props} />;
};

export default Input;
