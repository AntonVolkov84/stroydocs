import "./Button.css";

interface PersonalPageProps {
  children: string;
  onClick?: () => void;
  typeBtn?: "reset" | "button" | "submit";
  styled?: {};
  className?: string;
}

function Button({ children, onClick, typeBtn = "button", styled, className = "button_btn" }: PersonalPageProps) {
  return (
    <button style={styled} type={typeBtn} className={`button_btn ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;
