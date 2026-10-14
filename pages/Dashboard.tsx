import { useState, useEffect } from "react";
import "./Dashboard.css";
import New from "../components/New";
import Slider from "../components/Slider";
import Feedback from "../components/Feedback";
import BannerFeedback from "../components/BannerFeedback";
import Confirmation from "../components/Confirmation";
import { getAllNews } from "../services/newsServise";
import * as calculatorService from "../services/calculatorService";
import { CalculatorInterface } from "../type";

import CO0 from "../src/CO0.png";
import CO1 from "../src/CO1.png";
import VE1 from "../src/Vedomost.png";

interface NewsData {
  author_email: string;
  created_at: string;
  id: number;
  imageurl: string;
  text: string;
  title: string;
  updated_at: string;
  imagepublicid: string;
}

export default function Dashboard() {
  const [newsData, setNewsData] = useState<NewsData[] | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<boolean>(false);
  const [calculators, setCalculators] = useState<CalculatorInterface[] | null>(null);

  const getNewsData = async () => {
    try {
      const res = await getAllNews();
      if (Array.isArray(res)) {
        setNewsData(res);
      } else {
        console.warn("Некорректный формат данных при получении новостей:", res);
      }
    } catch (error) {
      console.error("Ошибка при загрузке новостей newsData Dashboard:", error);
    }
  };

  const fetchCalculators = async (): Promise<void> => {
    try {
      const data = await calculatorService.getAllCalculators();
      setCalculators(data);
    } catch (err) {
      console.error("Ошибка при получении калькуляторов", err);
    }
  };

  useEffect(() => {
    fetchCalculators();
    getNewsData();
  }, []);

  const customSlides = [
    {
      title: "Коммерческое предложение форма 0",
      formula: "Форма ноль включает в себя краткое предложение с указанием общей стоимости",
      image_url: CO0,
    },
    {
      title: "Коммерческое предложение форма 1",
      formula:
        "Форма 1 включает в себя разбивку цены на составляющие. В обоих формах есть возможность выбора налоговой ставки",
      image_url: CO1,
    },
    {
      title: "Ведомость объемов работ",
      formula: "Можно экспортировать данные в ведомость из форм коммерческого предложения",
      image_url: VE1,
    },
  ];

  return (
    <main className="dashboard-main-content">
      <Confirmation
        open={isOpen}
        title="Удалить элемент?"
        message="Вы уверены, что хотите удалить этот элемент?"
        confirmText="Да"
        cancelText="Нет"
        onConfirm={() => console.log("confirm")}
        onCancel={() => setIsOpen(false)}
      />

      {Array.isArray(newsData) && newsData[0] && <New item={newsData[0]} />}

      <div className="block__slider">
        <Slider title="Документы" slides={customSlides} />
      </div>

      {Array.isArray(newsData) && newsData[1] && <New reversed item={newsData[1]} />}

      {feedbackModal ? (
        <Feedback setFeedbackModal={setFeedbackModal} />
      ) : (
        <BannerFeedback setFeedbackModal={setFeedbackModal} />
      )}

      {Array.isArray(newsData) && newsData[2] && <New item={newsData[2]} />}

      {calculators && (
        <div className="block__slider">
          <Slider title="Калькуляторы" slides={calculators} />
        </div>
      )}

      {Array.isArray(newsData) && newsData[3] && <New reversed item={newsData[3]} />}
    </main>
  );
}
