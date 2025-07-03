import { Link } from "react-router-dom";
import "./Dashboard.css";
import telegram from "../src/icons/telegram.svg";
import youtube from "../src/icons/youtube.svg";
import facebook from "../src/icons/facebook.svg";

export default function Dashboard() {
  return (
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
              <span>О министерстве ▾</span>
              <div className="dashboard-submenu">
                <div className="dashboard-submenu-inner">
                  <a className="dashboard-submenu-href" href="#">
                    Руководство
                  </a>
                  <a href="#">Департаменты</a>
                  <a href="#">Еще что-то там</a>
                </div>
              </div>
            </li>
            <li className="dashboard-menu-item">
              <span>Пресс‑центр ▾</span>
              <div className="dashboard-submenu">
                <div className="dashboard-submenu-inner">
                  <a className="dashboard-submenu-href" href="#">
                    Новости
                  </a>
                  <a href="#">Фото</a>
                </div>
              </div>
            </li>
            <li className="dashboard-menu-item">
              <span>Документы ▾</span>
              <div className="dashboard-submenu">
                <div className="dashboard-submenu-inner">
                  <a className="dashboard-submenu-href" href="#">
                    Все
                  </a>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
