import "./PersonalPage.css";
import { useState, useEffect } from "react";
import * as authServices from "../services/authServices";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import ConstructorCalculator from "../components/ConstructorCalculator";

interface User {
  id: string;
  email: string;
  username: string;
  emailConfirmed: boolean;
  isAdmin?: boolean;
}
interface AdminUser extends User {
  admin?: boolean;
}
interface PersonalPageProps {
  user: AdminUser;
  setUser: (user: User | null) => void;
}

export default function PersonalPage({ user, setUser }: PersonalPageProps) {
  const [constructorCalculator, setConstructorCalculator] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && typeof user.isAdmin === "boolean") {
      setIsAdmin(user.isAdmin);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const handleLogOut = (): void => {
    authServices.logout();
    setUser(null);
  };
  return (
    <div className="personalpage">
      <aside className="personalpage__sidebar">
        <h2>{isAdmin ? "Профиль Администратора" : "Профиль"} </h2>
        <ul>
          <li>Мой аккаунт</li>
          <li>Настройки</li>
          {isAdmin && (
            <li
              onClick={() => {
                setConstructorCalculator(true);
              }}
            >
              Создание калькулятора
            </li>
          )}
          <li onClick={() => navigate("/changepassword")}>Сменить пароль</li>
          <li onClick={() => handleLogOut()}>Выход</li>
        </ul>
      </aside>

      <main className="personalpage__main">
        <h1>Добро пожаловать, {user.username}</h1>
        {constructorCalculator ? (
          <div className="personalpage__content">
            <Button
              onClick={() => {
                setConstructorCalculator(false);
              }}
              children="Отмена"
            />
            <ConstructorCalculator />
          </div>
        ) : (
          <div className="personalpage__content">
            <p>Здесь будет персональная информация, действия пользователя, уведомления и т.п.</p>
          </div>
        )}
      </main>
    </div>
  );
}
