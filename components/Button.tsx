import "./Button.css";

interface PersonalPageProps {
  children: string;
  onClick?: () => void;
  typeBtn?: "reset" | "button" | "submit";
  styled?: {};
}

function Button({ children, onClick, typeBtn = "button", styled }: PersonalPageProps) {
  return (
    <button style={styled} type={typeBtn} className="button_btn" onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;
