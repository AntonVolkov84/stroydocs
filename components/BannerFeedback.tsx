import "./BannerFeedback.css";
import BannerImage from "../src/feedback.png";

interface BannerFeedBackProps {
  setFeedbackModal?: React.Dispatch<React.SetStateAction<boolean>>;
  title?: string;
  description?: string;
  buttonText?: string;
}

function BannerFeedback({
  setFeedbackModal,
  title = "Обратная связь",
  description = "Вы можете связаться с нами по любому вопросу: добавление калькулятора, новой формы и т.п.",
  buttonText = "Связаться",
}: BannerFeedBackProps) {
  return (
    <div className="bannerfeedback__container">
      <div className="bannerfeedback__content">
        <h2 className="bannerfeedback__title">{title}</h2>
        <p className="bannerfeedback__description">{description}</p>
        <button
          className="bannerfeedback__button"
          onClick={() => {
            if (setFeedbackModal) setFeedbackModal(true);
          }}
        >
          {buttonText}
        </button>
      </div>
      <div className="bannerfeedback__image-wrapper">
        <img src={BannerImage} alt="Обратная связь" className="bannerfeedback__image" />
      </div>
    </div>
  );
}

export default BannerFeedback;
