import "./PersonalPage.css";
import { useState, useEffect } from "react";
import * as authServices from "../services/authServices";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import ConstructorCalculator from "../components/ConstructorCalculator";
import ManageCalculator from "../components/ManageCalculator";
import ManageUsers from "../components/ManageUsers";

interface User {
  id: string;
  email: string;
  username: string;
  emailConfirmed: boolean;
  isAdmin?: boolean;
  name: string;
  surname: string;
}
interface AdminUser extends User {
  admin?: boolean;
}
interface PersonalPageProps {
  user: AdminUser;
  setUser: (user: User | null) => void;
}
export interface Calculator {
  id: number;
  title: string;
  formula: string;
  variables: Record<string, any>;
  author_email: string;
  result_unit: string;
  created_at: string;
  updated_at: string;
}

export default function PersonalPage({ user, setUser }: PersonalPageProps) {
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [constructorCalculator, setConstructorCalculator] = useState<boolean>(false);
  const [managerCalculator, setManagerCalculator] = useState<boolean>(false);
  const [managerUser, setManagerUser] = useState<boolean>(false);
  const [selectedCalculator, setSelectedCalculator] = useState<Calculator | null>(null);
  const navigate = useNavigate();
  const currentUserEmail = user.email;

  const clearState = () => {
    setManagerCalculator(false);
    setConstructorCalculator(false);
    setManagerUser(false);
  };

  useEffect(() => {
    if (user.email === "antvolkov84@gmail.com" || user.email === "aleks_e@inbox.ru") {
      setIsSuperAdmin(true);
    }
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
          {isSuperAdmin && (
            <li
              onClick={() => {
                clearState();
                setManagerUser(true);
              }}
            >
              Управление пользователями
            </li>
          )}
          {isAdmin && (
            <>
              <li
                onClick={() => {
                  clearState();
                  setConstructorCalculator(true);
                }}
              >
                Создание калькулятора
              </li>
              <li
                onClick={() => {
                  clearState();
                  setManagerCalculator(true);
                }}
              >
                Управление калькуляторами
              </li>
            </>
          )}
          <li onClick={() => navigate("/changepassword")}>Сменить пароль</li>
          <li onClick={() => handleLogOut()}>Выход</li>
        </ul>
      </aside>
      <main className="personalpage__main">
        <h1>
          Добро пожаловать, {user.name} {user.surname}
        </h1>
        {constructorCalculator ? (
          <div className="personalpage__content">
            <ConstructorCalculator
              selectedCalculator={selectedCalculator}
              onUpdated={() => setManagerCalculator(true)}
            />
            <Button
              onClick={() => {
                setConstructorCalculator(false);
                setSelectedCalculator(null);
              }}
              children="Отмена"
            />
          </div>
        ) : (
          <>
            {managerCalculator ? (
              <ManageCalculator
                setManagerCalculator={setManagerCalculator}
                setConstructorCalculator={setConstructorCalculator}
                setSelectedCalculator={setSelectedCalculator}
              />
            ) : (
              <>
                {managerUser ? (
                  <ManageUsers currentUserEmail={currentUserEmail} />
                ) : (
                  <div className="personalpage__content">
                    <p>Здесь будет персональная информация, действия пользователя, уведомления и т.п.</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
