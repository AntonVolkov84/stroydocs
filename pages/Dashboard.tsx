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
import { CalculatorInterface } from "../type";
import CommercialOfferForm from "../components/CommercialOfferForm";
import Confirmation from "../components/Confirmation";
import Slider from "../components/Slider";
import CO0 from "../src/CO0.png";
import CO1 from "../src/CO1.png";
import VE1 from "../src/Vedomost.png";
import Logo from "../src/StroydoksLogo2.png";
import Feedback from "../components/Feedback";
import BannerFeedback from "../components/BannerFeedback";
import ReferenceBook from "../components/ReferenceBook";
import Management from "../components/Management";
import SecondCommercialOfferForm from "../components/SecondCommercialOfferForm";
import BillOfQuantities from "../components/BillOfQuantities";
import Fileimport from "../components/Fileimport";
import { useAppContext } from "../services/AppContext";
import ApkFile from "../src/appstroydoks.apk";
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
  const { setMode, mode, exportedRows, setExportedRows, exportData, setExportData } = useAppContext();

  const clearMode = () => {
    setMode({
      calculators: false,
      fileimport: false,
      form: false,
      form1: false,
      form2: false,
      referencebook: false,
      management: false,
    });
    setExportedRows(null);
    setExportData(null);
  };
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
    <>
      <header className="dashboard-header">
        <div className="dashboard-top-bar">
          <div className="dashboard-container-top">
            <div className="dashboard-top-nav">
              <div className="dashboard-top-left">
                <a href={ApkFile} className="dashboard-top-downloadapk" download>
                  📱 Скачать Stroydoks.apk
                </a>
              </div>
              <div className="dashboard-top-right">
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
        </div>
        <div className="dashboard-menu-bar">
          <div className="dashboard-container">
            <ul className="dashboard-main-menu">
              <li className="dashboard-menu-logo">
                <img src={Logo} alt="Stroydoks Logo" className="dashboard-logo-img" />
              </li>
              <li className="dashboard-menu-item">
                <span>О компании ▾</span>
                <div className="dashboard-submenu">
                  <div className="dashboard-submenu-inner">
                    <button
                      onClick={() => {
                        setExportedRows(null);
                        setExportData(null);
                        setMode((prev) => ({
                          referencebook: false,
                          calculators: false,
                          form: false,
                          form1: false,
                          form2: false,
                          management: true,
                          fileimport: false,
                        }));
                      }}
                      style={{ padding: "10px" }}
                      className="dashboard-submenu-href"
                    >
                      Руководство
                    </button>
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
                          style={{ padding: "10px" }}
                          key={calc.id}
                          onClick={() => {
                            setExportedRows(null);
                            setExportData(null);
                            setMode((prev) => ({
                              referencebook: false,
                              form: false,
                              form1: false,
                              form2: false,
                              calculators: calc,
                              management: false,
                              fileimport: false,
                            }));
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
                      style={{ padding: "10px" }}
                      onClick={() => {
                        setExportedRows(null);
                        setExportData(null);
                        setMode((prev) => ({
                          referencebook: false,
                          calculators: false,
                          form: true,
                          form1: false,
                          form2: false,
                          management: false,
                          fileimport: false,
                        }));
                      }}
                      className="dashboard-submenu-href"
                    >
                      Коммерческое предложение форма 0
                    </button>
                    <button
                      style={{ padding: "10px" }}
                      onClick={() => {
                        setExportedRows(null);
                        setExportData(null);
                        setMode((prev) => ({
                          referencebook: false,
                          calculators: false,
                          form: false,
                          form1: true,
                          form2: false,
                          management: false,
                          fileimport: false,
                        }));
                      }}
                      className="dashboard-submenu-href"
                    >
                      Коммерческое предложение форма 1
                    </button>
                    <button
                      style={{ padding: "10px" }}
                      onClick={() => {
                        setExportedRows(null);
                        setExportData(null);
                        setMode((prev) => ({
                          referencebook: false,
                          calculators: false,
                          form: false,
                          form1: false,
                          form2: true,
                          management: false,
                          fileimport: false,
                        }));
                      }}
                      className="dashboard-submenu-href"
                    >
                      Ведомость объёмов работ
                    </button>
                    <button
                      style={{ padding: "10px" }}
                      onClick={() => {
                        setExportedRows(null);
                        setExportData(null);
                        setMode((prev) => ({
                          referencebook: false,
                          calculators: false,
                          form: false,
                          form1: false,
                          form2: false,
                          management: false,
                          fileimport: true,
                        }));
                      }}
                      className="dashboard-submenu-href"
                    >
                      Загрузить из файла
                    </button>
                  </div>
                </div>
              </li>
              <li className="dashboard-menu-item">
                <span>Справочники ▾</span>
                <div className="dashboard-submenu">
                  <div className="dashboard-submenu-inner">
                    <button
                      onClick={() => {
                        setExportedRows(null);
                        setExportData(null);
                        setMode((prev) => ({
                          referencebook: true,
                          calculators: false,
                          form: false,
                          form1: false,
                          form2: false,
                          management: false,
                          fileimport: false,
                        }));
                      }}
                      style={{ padding: "10px" }}
                      className="dashboard-submenu-href"
                    >
                      Все справочники
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </header>
      <main>
        {mode.management && <Management setMode={setMode} />}
        {mode.form2 && (
          <BillOfQuantities
            clearMode={clearMode}
            setMode={setMode}
            initialRows={exportedRows}
            showBackButton={!exportData}
            initialTitle={exportData?.title}
            initialOfferId={exportData?.offerId}
          />
        )}
        {mode.form && (
          <CommercialOfferForm
            clearMode={clearMode}
            setMode={setMode}
            initialRows={exportedRows}
            setExportedRows={setExportedRows}
            initialTaxRate={exportData?.taxRate}
            showBackButton={!exportData}
            initialTitle={exportData?.title}
            initialOfferId={exportData?.offerId}
          />
        )}
        {mode.referencebook && <ReferenceBook clearMode={clearMode} />}
        {mode.form1 && (
          <SecondCommercialOfferForm
            setMode={setMode}
            clearMode={clearMode}
            setExportedRows={setExportedRows}
            initialRows={exportedRows}
            initialTaxRate={exportData?.taxRate}
            showBackButton={!exportData}
            initialTitle={exportData?.title}
            initialOfferId={exportData?.offerId}
          />
        )}
        {mode.fileimport && <Fileimport clearMode={clearMode} />}
        {mode.calculators ? (
          <CalculatorComponent mode={mode} setMode={setMode} />
        ) : (
          <>
            <Confirmation
              open={isOpen}
              title="Удалить элемент?"
              message="Вы уверены, что хотите удалить этот элемент?"
              confirmText="Да"
              cancelText="Нет"
              onConfirm={() => console.log("confirm")}
              onCancel={() => setIsOpen(false)}
            />
            {!mode.calculators &&
            !mode.form &&
            !mode.form1 &&
            !mode.form2 &&
            !mode.referencebook &&
            !mode.fileimport &&
            !mode.management ? (
              <>
                {Array.isArray(newsData) && <New item={newsData[0]} />}
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
              </>
            ) : null}
          </>
        )}
      </main>
    </>
  );
}
