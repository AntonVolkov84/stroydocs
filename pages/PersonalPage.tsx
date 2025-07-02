import "./PersonalPage.css";
import { useState, useEffect } from "react";
import * as authServices from "../services/authServices";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  email: string;
  username: string;
  emailConfirmed: boolean;
}
interface AdminUser extends User {
  admin?: boolean;
}
interface PersonalPageProps {
  user: AdminUser;
  setUser: (user: User | null) => void;
}

export default function PersonalPage({ user, setUser }: PersonalPageProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  console.log(isAdmin);
  useEffect(() => {
    user?.admin ? setIsAdmin(true) : setIsAdmin(false);
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
          <li onClick={() => navigate("/changepassword")}>Сменить пароль</li>
          <li onClick={() => handleLogOut()}>Выход</li>
        </ul>
      </aside>

      <main className="personalpage__main">
        <h1>Добро пожаловать, {user.username}</h1>
        <div className="personalpage__content">
          <p>Здесь будет персональная информация, действия пользователя, уведомления и т.п.</p>
        </div>
      </main>
    </div>
  );
}
