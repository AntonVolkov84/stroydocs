import "./Button.css";

interface PersonalPageProps {
  children: string;
  onClick: () => void;
}

function Button({ children, onClick }: PersonalPageProps) {
  return (
    <button className="button_btn" onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;
