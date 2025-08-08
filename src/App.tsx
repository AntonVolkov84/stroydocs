import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import Dashboard from "../pages/Dashboard";
import ConfirmEmail from "../components/ConfirmEmail";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ChangePasswordPage from "../pages/ChangePasswordPage";
import PersonalPage from "../pages/PersonalPage";
import NoPage from "../pages/NoPage";
import { AppProvider, useAppContext } from "../services/AppContext";
import Loader from "../components/Loader";

function AppRoutes() {
  const { user, loading } = useAppContext();
  if (loading) {
    return <Loader />;
  }
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/confirm-email" element={<ConfirmEmail />} />
      <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
      <Route path="/changepassword" element={<ChangePasswordPage user={user} />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/personalpage" element={user && user.emailconfirmed ? <PersonalPage /> : <Navigate to="/login" />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NoPage />} />
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
}

export default App;
