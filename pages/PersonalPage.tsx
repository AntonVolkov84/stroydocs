import "./PersonalPage.css";
import { useState, useEffect } from "react";
import * as authServices from "../services/authServices";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import ConstructorCalculator from "../components/ConstructorCalculator";
import ManageCalculator from "../components/ManageCalculator";
import ManageUsers from "../components/ManageUsers";
import CreatingNews from "../components/CreatingNews";
import SavedCalculators from "../components/SavedCalculators";
import Commercial from "../components/Commercial";
import { useAppContext } from "../services/AppContext";
import ManageReferenceBooks from "../components/ManageReferenceBooks";

export interface Calculator {
  id: number;
  title: string;
  formula: string;
  variables: Record<string, any>;
  author_email: string;
  result_unit: string;
  created_at: string;
  updated_at: string;
  image_url?: string;
  image_public_id?: string;
}

export default function PersonalPage() {
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [constructorCalculator, setConstructorCalculator] = useState<boolean>(false);
  const [managerCalculator, setManagerCalculator] = useState<boolean>(false);
  const [managerUser, setManagerUser] = useState<boolean>(false);
  const [manageReferenceBooks, setManageReferenceBooks] = useState(false);
  const [creatingNews, setCreatingNews] = useState<boolean>(false);
  const [selectedCalculator, setSelectedCalculator] = useState<Calculator | null>(null);
  const [savedCalculator, setSavedCalculator] = useState<boolean>(false);
  const [savedCommercialOffer, setSavedCommercialOffer] = useState<boolean>(false);
  const navigate = useNavigate();
  const { user, setUser } = useAppContext();
  const currentUserEmail = user?.email;

  const clearState = () => {
    setManagerCalculator(false);
    setConstructorCalculator(false);
    setManagerUser(false);
    setCreatingNews(false);
    setSavedCalculator(false);
    setSavedCommercialOffer(false);
    setSelectedCalculator(null);
    setManageReferenceBooks(false);
  };

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
  };
  return (
    <div className="personalpage">
      <aside className="personalpage__sidebar">
        <h2>{isAdmin ? "Профиль Администратора" : "Профиль"} </h2>
        <ul>
          <Link to="/dashboard" className="personalpage__sidebar-dashboard" onClick={() => {}}>
            На главную
          </Link>
          <li
            onClick={() => {
              clearState();
              setSavedCalculator(true);
            }}
          >
            Сохраненные данные по калькуляторам
          </li>
          <li
            onClick={() => {
              clearState();
              setSavedCommercialOffer(true);
            }}
          >
            Сохраненные документы
          </li>
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
            <li
              onClick={() => {
                clearState();
                setCreatingNews(true);
              }}
            >
              Управление новостями
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
              <li
                onClick={() => {
                  clearState();
                  setManageReferenceBooks(true);
                }}
              >
                Управление справочниками
              </li>
            </>
          )}
          <li onClick={() => navigate("/changepassword")}>Сменить пароль</li>
          <li onClick={() => handleLogOut()}>Выход</li>
        </ul>
      </aside>
      <main className="personalpage__main">
        <h1>
          Добро пожаловать, {user?.name} {user?.surname}
        </h1>
        {creatingNews && <CreatingNews />}
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
              <>{managerUser && <ManageUsers currentUserEmail={currentUserEmail} />}</>
            )}
          </>
        )}
        {manageReferenceBooks && (isAdmin || isSuperAdmin) && <ManageReferenceBooks />}
        {savedCommercialOffer && <Commercial />}
        {savedCalculator && <SavedCalculators />}
        {!managerCalculator &&
          !constructorCalculator &&
          !managerUser &&
          !manageReferenceBooks &&
          !creatingNews &&
          !savedCalculator &&
          !savedCommercialOffer && (
            <div className="personalpage__content">
              <p>Здесь будет персональная информация, действия пользователя, уведомления и т.п.</p>
            </div>
          )}
      </main>
    </div>
  );
}
