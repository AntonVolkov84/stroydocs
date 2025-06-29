import "./App.css";
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import Dashboard from "../pages/Dashboard";
import axios from "axios";
import ConfirmEmail from "../components/ConfirmEmail";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ChangePasswordPage from "../pages/ChangePasswordPage";

interface User {
  id: string;
  email: string;
  username: string;
  emailConfirmed: boolean;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .post<User>("/stroydocs/me", {}, { withCredentials: true })
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
    <Router>
      <Routes>
        <Route
          path="/dashboard"
          element={
            user && user.emailConfirmed ? <Dashboard setUser={setUser} user={user} /> : <Navigate to="/login" replace />
          }
        />
        <Route path="/login" element={!user ? <LoginPage setUser={setUser} /> : <Navigate to="/dashboard" replace />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />
        <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
        <Route path="/changepassword" element={<ChangePasswordPage />} />
        <Route
          path="/register"
          element={!user ? <RegisterPage setUser={setUser} /> : <Navigate to="/dashboard" replace />}
        />
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        <Route path="*" element={<div>404 - Страница не найдена</div>} />
      </Routes>
    </Router>
  );
}

export default App;
