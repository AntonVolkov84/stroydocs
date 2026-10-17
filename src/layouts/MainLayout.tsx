// src/layouts/MainLayout.tsx
import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import telegram from "../icons/telegram.svg";
import youtube from "../icons/youtube.svg";
import facebook from "../icons/facebook.svg";
import Logo from "../logo.jpg";
import ApkFile from "../stroydoks.apk";
import "../../pages/Dashboard.css";
import { CalculatorInterface } from "../../type";
import * as calculatorService from "../../services/calculatorService";

export default function MainLayout() {
  const [calculators, setCalculators] = useState<CalculatorInterface[] | null>(null);
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
                <Link to="/personal" className="dashboard-top-link">
                  Личный кабинет
                </Link>
                <div className="social-icons">
                  <a href="https://youtube.com" className="social-icons-item" target="_blank" rel="noreferrer">
                    <img className="inverted-icon" src={youtube} alt="YouTube" />
                  </a>
                  <a href="https://facebook.com" className="social-icons-item" target="_blank" rel="noreferrer">
                    <img className="inverted-icon" src={facebook} alt="Facebook" />
                  </a>
                  <a href="https://telegram.org" className="social-icons-item" target="_blank" rel="noreferrer">
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
                <Link to="/">
                  <img src={Logo} alt="Stroydoks Logo" className="dashboard-logo-img" />
                </Link>
              </li>
              <li className="dashboard-menu-item">
                <span>О компании ▾</span>
                <div className="dashboard-submenu">
                  <div className="dashboard-submenu-inner">
                    <Link to="/management" style={{ padding: "10px" }} className="dashboard-submenu-href">
                      Руководство
                    </Link>
                  </div>
                </div>
              </li>
              <li className="dashboard-menu-item">
                <span>Калькулятор ▾</span>
                <div className="dashboard-submenu">
                  <div className="dashboard-submenu-inner">
                    {calculators &&
                      calculators.map((calc) => (
                        <Link
                          key={calc.id}
                          to={`/calculator/${calc.id}`}
                          style={{ padding: "10px" }}
                          className="dashboard-submenu-href"
                        >
                          {calc.title}
                        </Link>
                      ))}
                  </div>
                </div>
              </li>
              {/* Пункт с сервисами, где задействуем переход по ссылке */}
              <li className="dashboard-menu-item">
                <span>Формы ▾</span>
                <div className="dashboard-submenu">
                  <div className="dashboard-submenu-inner">
                    <Link
                      className="dashboard-submenu-href"
                      style={{ paddingBottom: 10, paddingTop: 10 }}
                      to="/forms/commercial-offer-0"
                    >
                      Коммерческие предложения форма 0
                    </Link>
                    <Link to="/forms/commercial-offer-1" style={{ padding: "10px" }} className="dashboard-submenu-href">
                      Коммерческое предложение форма 1
                    </Link>
                    <Link to="/forms/bill-of-quantities" style={{ padding: "10px" }} className="dashboard-submenu-href">
                      Ведомость объёмов работ
                    </Link>
                    <Link
                      to="/forms/specificationformpage"
                      style={{ padding: "10px" }}
                      className="dashboard-submenu-href"
                    >
                      Спецификация
                    </Link>
                    <Link to="/fileimport" style={{ padding: "10px" }} className="dashboard-submenu-href">
                      Импорт файлов
                    </Link>
                  </div>
                </div>
              </li>
              <li className="dashboard-menu-item">
                <span>Справочники ▾</span>
                <div className="dashboard-submenu">
                  <div className="dashboard-submenu-inner">
                    <Link to="/referencebook" style={{ padding: "10px" }} className="dashboard-submenu-href">
                      Все справочники
                    </Link>
                  </div>
                </div>
              </li>
              <li className="dashboard-menu-item">
                <span>Сервисы ▾</span>
                <div className="dashboard-submenu">
                  <div className="dashboard-submenu-inner">
                    <Link
                      className="dashboard-submenu-href"
                      style={{ paddingBottom: 10, paddingTop: 10 }}
                      to="/servicepage"
                    >
                      Коммерческие предложения
                    </Link>
                    <Link
                      className="dashboard-submenu-href"
                      style={{ paddingBottom: 10, paddingTop: 10 }}
                      to="/servicepagebill"
                    >
                      Заявки на работу
                    </Link>
                  </div>
                </div>
              </li>

              {/* Остальные пункты меню пока оставляем или постепенно переводим на Link */}
            </ul>
          </div>
        </div>
      </header>

      {/* Сюда будут подставляться страницы (Dashboard, ServicePage и др.) */}
      <main>
        <Outlet />
      </main>
    </>
  );
}
