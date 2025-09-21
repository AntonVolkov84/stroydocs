import "./Management.css";
import { useState, Dispatch, SetStateAction } from "react";
import Owner from "../src/5201928801548877058.jpg";
import Programmer from "../src/anton.jpg";
import Feedback from "./Feedback";
import BannerFeedback from "./BannerFeedback";
import { Mode } from "../type";
import Button from "./Button";
import ImageToggle from "./ImageToggle";

interface ManagementProps {
  setMode: Dispatch<SetStateAction<Mode>>;
}

function Management({ setMode }: ManagementProps) {
  const [feedbackModal, setFeedbackModal] = useState(false);
  return (
    <div className="management__container">
      <div className="management__blockinfo">
        <Button
          styled={{ marginBottom: 25, marginTop: 13 }}
          onClick={() => setMode((prev) => ({ ...prev, management: false }))}
        >
          ← Назад
        </Button>
        <div className="management__card">
          <div className="management__card-blockimage">
            <div className="management__image-wrapper">
              <ImageToggle src={Owner} alt="Создатель" />
            </div>
          </div>
          <div className="management__info">
            <h2 className="management__title">Евгений Александров</h2>
            <p className="management__role">Основатель и владелец</p>
            <p className="management__desc">
              Евгений — основатель проекта, отвечает за архитектуру и стратегию развития сайта. Более 10 лет опыта в
              проектной документации и составлении смет.
            </p>
            <p className="management__role">Личная почта для контакта: aleks_e@inbox.ru</p>
          </div>
        </div>
        <div className="management__card">
          <div className="management__card-blockimage">
            <div className="management__image-wrapper">
              <ImageToggle src={Programmer} alt="Создатель" />
            </div>
          </div>
          <div className="management__info">
            <h2 className="management__title"> Антон Волков</h2>
            <p className="management__role">Разработчик</p>
            <p className="management__desc">
              Антон — создатель и разработчик проекта, отвечает за архитектуру и разработку ключевых модулей. Более 5
              лет опыта в IT, увлекается созданием игр, развивающих программ для детей и семейно-полезных приложений для
              различных платформ.
            </p>
            <p className="management__role">Личная почта для контакта: antvolkov84@gmail.com</p>
          </div>
        </div>
      </div>
      {feedbackModal ? (
        <Feedback setFeedbackModal={setFeedbackModal} />
      ) : (
        <BannerFeedback
          title="Напишите нам"
          description="Ваше сообщение будет отправлено нам двоим, для бытрого реагирования и большего внимания!"
          setFeedbackModal={setFeedbackModal}
        />
      )}
    </div>
  );
}

export default Management;
