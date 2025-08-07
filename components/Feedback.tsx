import { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import "./Feedback.css";
import { useAppContext } from "../services/AppContext";
interface FeedbackProps {
  setFeedbackModal?: React.Dispatch<React.SetStateAction<boolean>>;
}
function Feedback({ setFeedbackModal }: FeedbackProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sendingMail, setSendingMail] = useState(false);
  const [email, setEmail] = useState<string | undefined>("");
  const [status, setStatus] = useState<string | null>(null);
  const { user, alert } = useAppContext();
  const currentUserEmail = user?.email;

  useEffect(() => {
    setEmail(currentUserEmail);
  }, [currentUserEmail]);

  const handleSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSendingMail(true);
    const hasDangerousTags = /<\s*script|on\w+=|<\s*iframe/i.test(message);
    if (hasDangerousTags) {
      alert({
        title: "Ошибка",
        message: "В сообщении обнаружен запрещённый HTML. Пожалуйста, удалите его.",
      });
      setSendingMail(false);
      return;
    }
    const serviceId = "service_d11exx1";
    const templateId = "template_12aagmr";
    const publicKey = "NhQ2J0fY_65vJzShl";
    const templateParams = {
      name: `${user?.name} ${user?.surname}`,
      email: email,
      title: subject,
      subject: subject,
      message: message,
    };
    emailjs.send(serviceId, templateId, templateParams, publicKey).then(
      async (response) => {
        const statusText = "Сообщение отправлено успешно!";
        setStatus(statusText);
        await alert({
          title: "Внимание",
          message: statusText,
        });
        if (setFeedbackModal) setFeedbackModal(false);
        setSubject("");
        setMessage("");
        setSendingMail(false);
      },
      async (err) => {
        const statusText = "Ошибка при отправке. Попробуйте ещё раз.";
        setStatus(statusText);
        await alert({
          title: "Внимание",
          message: statusText,
        });
        setSendingMail(false);
      }
    );
  };

  const handleCancel = () => {
    if (setFeedbackModal) setFeedbackModal(false);
    setSubject("");
    setMessage("");
    setStatus(null);
  };

  return (
    <div className="feedback__container">
      <div className="feedback__block">
        <h2 className="feedback__title">Обратная связь</h2>
        <form onSubmit={handleSend}>
          <div className="feedback__field">
            <label className="feedback__label">Ваш Email</label>
            <input
              type="email"
              className="feedback__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="feedback__field">
            <label className="feedback__label">Тема</label>
            <input
              type="text"
              className="feedback__input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          <div className="feedback__field">
            <label className="feedback__label">Сообщение</label>
            <textarea
              className="feedback__input"
              style={{ height: "120px", resize: "vertical" }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            ></textarea>
          </div>
          <button disabled={sendingMail} type="submit" className="feedback__submit-button">
            Отправить
          </button>
          <button
            type="button"
            className="feedback__submit-button"
            style={{ backgroundColor: "#ccc", color: "#333" }}
            onClick={handleCancel}
          >
            Отмена
          </button>
          {status && <p style={{ marginTop: "16px", textAlign: "center", color: "#333" }}>{status}</p>}
        </form>
      </div>
    </div>
  );
}

export default Feedback;
