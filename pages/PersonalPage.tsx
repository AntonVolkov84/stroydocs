import "./PersonalPage.css";
import { useState, useEffect } from "react";
import * as authServices from "../services/authServices";
import { Link, useNavigate, Outlet } from "react-router-dom"; // 👈 Добавили Outlet
import { useAppContext } from "../services/AppContext";

export default function PersonalPage() {
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useAppContext();

  useEffect(() => {
    if (!user) return;
    if (user.email === "antvolkov84@gmail.com" || user.email === "aleks_e@inbox.ru") {
      setIsSuperAdmin(true);
    }
    if (user && typeof user.isadmin === "boolean") {
      setIsAdmin(user.isadmin);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const handleLogOut = (): void => {
    setUser(null);
    authServices.logout();
    navigate("/login");
  };

  return (
    <div className="personalpage">
      <aside className="personalpage__sidebar">
        <h2>{isAdmin ? "Профиль Администратора" : "Профиль"}</h2>
        <button className="personalpage__menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰ Меню
        </button>
        <ul className={menuOpen ? "show" : ""}>
          <Link to="/dashboard" className="personalpage__sidebar-dashboard" onClick={() => setMenuOpen(false)}>
            На главную
          </Link>
          <Link to="/personal/company" className="personalpage__sidebar-dashboard" onClick={() => setMenuOpen(false)}>
            Данные предприятия
          </Link>
          <Link
            to="/personal/saved-calculators"
            className="personalpage__sidebar-dashboard"
            onClick={() => setMenuOpen(false)}
          >
            Сохраненные данные по калькуляторам
          </Link>
          <Link
            to="/personal/commercial"
            className="personalpage__sidebar-dashboard"
            onClick={() => setMenuOpen(false)}
          >
            Сохраненные документы
          </Link>
          {isSuperAdmin && (
            <Link to="/personal/users" className="personalpage__sidebar-dashboard" onClick={() => setMenuOpen(false)}>
              Управление пользователями
            </Link>
          )}
          {isAdmin && (
            <>
              <Link to="/personal/news" className="personalpage__sidebar-dashboard" onClick={() => setMenuOpen(false)}>
                Управление новостями
              </Link>
              <Link
                to="/personal/calculator-create"
                className="personalpage__sidebar-dashboard"
                onClick={() => setMenuOpen(false)}
              >
                Создание калькулятора
              </Link>
              <Link
                to="/personal/calculators"
                className="personalpage__sidebar-dashboard"
                onClick={() => setMenuOpen(false)}
              >
                Управление калькуляторами
              </Link>
              <Link
                to="/personal/reference-books"
                className="personalpage__sidebar-dashboard"
                onClick={() => setMenuOpen(false)}
              >
                Управление справочниками
              </Link>
            </>
          )}
          <li onClick={() => navigate("/personal")}>Сменить пароль</li>
          <li onClick={() => handleLogOut()}>Выход</li>
        </ul>
      </aside>

      <main className="personalpage__main">
        <h1>
          Добро пожаловать, {user?.name} {user?.surname}
        </h1>
        <Outlet />
      </main>
    </div>
  );
}
