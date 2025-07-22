import { Link } from "react-router-dom";
import "./Dashboard.css";
import New from "../components/New";
import { useState, useEffect } from "react";
import telegram from "../src/icons/telegram.svg";
import youtube from "../src/icons/youtube.svg";
import facebook from "../src/icons/facebook.svg";
import { getAllNews } from "../services/newsServise";
import * as calculatorService from "../services/calculatorService";
import CalculatorComponent from "../components/Calculator";
import { CalculatorInterface, ModalState, Mode } from "../type";
import CommercialOfferForm from "../components/CommercialOfferForm";
import SecondCommercialOfferForm from "../components/SecondCommercialOfferForm";
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
  const [calculators, setCalculators] = useState<CalculatorInterface[] | null>(null);
  const [mode, setMode] = useState<Mode>({ calculators: false, form: false, form1: false });

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
  }, []);
  useEffect(() => {
    getNewsData();
  }, []);

  return (
    <>
      <header className="dashboard-header">
        <div className="dashboard-top-bar">
          <div className="dashboard-container-top">
            <div className="dashboard-top-nav">
              <Link to="/personalpage" className="dashboard-top-link">
                Личный кабинет
              </Link>
              <div className="social-icons">
                <a href="https://youtube.com" className="social-icons-item" target="_blank">
                  <img className="inverted-icon" src={youtube} alt="YouTube" />
                </a>
                <a href="https://facebook.com" className="social-icons-item" target="_blank">
                  <img className="inverted-icon" src={facebook} alt="Facebook" />
                </a>
                <a href="https://telegram.org" className="social-icons-item" target="_blank">
                  <img className="inverted-icon" src={telegram} alt="Telegram" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="dashboard-menu-bar">
          <div className="dashboard-container">
            <ul className="dashboard-main-menu">
              <li className="dashboard-menu-item">
                <span>О компании ▾</span>
                <div className="dashboard-submenu">
                  <div className="dashboard-submenu-inner">
                    <button className="dashboard-submenu-href">Руководство</button>
                    <button className="dashboard-submenu-href">Департаменты</button>
                    <button className="dashboard-submenu-href">Еще что-то там</button>
                  </div>
                </div>
              </li>
              <li className="dashboard-menu-item">
                <span>Калькулятор ▾</span>
                <div className="dashboard-submenu">
                  <div className="dashboard-submenu-inner">
                    {calculators &&
                      calculators.map((calc) => (
                        <button
                          key={calc.id}
                          onClick={() => {
                            setMode((prev) => ({ form: false, form1: false, calculators: calc }));
                          }}
                          className="dashboard-submenu-href"
                        >
                          {calc.title}
                        </button>
                      ))}
                  </div>
                </div>
              </li>
              <li className="dashboard-menu-item">
                <span>Формы ▾</span>
                <div className="dashboard-submenu">
                  <div className="dashboard-submenu-inner">
                    <button
                      onClick={() => {
                        setMode((prev) => ({ calculators: false, form: true, form1: false }));
                      }}
                      className="dashboard-submenu-href"
                    >
                      Коммерческое предложение форма 0
                    </button>
                    <button
                      onClick={() => {
                        setMode((prev) => ({ calculators: false, form: false, form1: true }));
                      }}
                      className="dashboard-submenu-href"
                    >
                      Коммерческое предложение форма 1
                    </button>
                  </div>
                </div>
              </li>
              <li className="dashboard-menu-item">
                <span>Отчеты ▾</span>
                <div className="dashboard-submenu">
                  <div className="dashboard-submenu-inner">
                    <button className="dashboard-submenu-href">Все отчеты</button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </header>
      <main>
        {mode.form && <CommercialOfferForm setMode={setMode} />}
        {mode.form1 && <SecondCommercialOfferForm setMode={setMode} />}
        {mode.calculators ? (
          <CalculatorComponent mode={mode} setMode={setMode} />
        ) : (
          <>
            {!mode.calculators && !mode.form && !mode.form1 ? (
              <>
                {Array.isArray(newsData) && <New item={newsData[0]} />}
                {Array.isArray(newsData) && newsData[1] && <New reversed item={newsData[1]} />}
                {Array.isArray(newsData) && newsData[2] && <New item={newsData[2]} />}
                {Array.isArray(newsData) && newsData[3] && <New reversed item={newsData[3]} />}
              </>
            ) : null}
          </>
        )}
      </main>
    </>
  );
}
