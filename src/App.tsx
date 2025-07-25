import "./App.css";
import { useEffect, useState, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import Dashboard from "../pages/Dashboard";
import axios from "axios";
import ConfirmEmail from "../components/ConfirmEmail";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ChangePasswordPage from "../pages/ChangePasswordPage";
import PersonalPage from "../pages/PersonalPage";
import NoPage from "../pages/NoPage";
import { AppContext } from "../services/AppContext";
import Confirmation from "../components/Confirmation";
import { ConfirmModalProps, User } from "../type";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmOptions, setConfirmOptions] = useState<Omit<
    ConfirmModalProps,
    "open" | "onConfirm" | "onCancel"
  > | null>(null);
  const [resolver, setResolver] = useState<(value: boolean) => void>(() => () => {});
  const apiUrl: string = import.meta.env.VITE_API_URL;

  const confirm = (options: Omit<ConfirmModalProps, "open" | "onConfirm" | "onCancel">): Promise<boolean> => {
    setConfirmOptions(options);
    return new Promise((resolve) => {
      setResolver(() => resolve);
    });
  };

  const handleConfirm = () => {
    setConfirmOptions(null);
    resolver(true);
  };

  const handleCancel = () => {
    setConfirmOptions(null);
    resolver(false);
  };

  useEffect(() => {
    axios
      .post<User>(`${apiUrl}/stroydocs/me`, {}, { withCredentials: true })
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);
  if (loading) {
    return <div>Загрузка...</div>;
  }
  return (
    <AppContext.Provider value={{ user, setUser, confirm }}>
      <Router>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          <Route path="/confirm-email" element={<ConfirmEmail />} />
          <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
          <Route path="/changepassword" element={<ChangePasswordPage user={user} />} />
          <Route path="/register" element={<RegisterPage setUser={setUser} />} />
          <Route
            path="/personalpage"
            element={user && user.emailConfirmed ? <PersonalPage /> : <Navigate to={"/login"} />}
          />
          <Route path="/" element={<Navigate to={"/dashboard"} replace />} />
          <Route path="*" element={<NoPage />} />
        </Routes>
      </Router>
      {confirmOptions && (
        <Confirmation open={true} {...confirmOptions} onConfirm={handleConfirm} onCancel={handleCancel} />
      )}
    </AppContext.Provider>
  );
}

export default App;
