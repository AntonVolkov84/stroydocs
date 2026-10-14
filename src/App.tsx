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
import ServicePage from "../pages/ServicePage";
import ServicePageBill from "../pages/ServicePageBill";
import MainLayout from "./layouts/MainLayout";
import Management from "../components/Management";
import CalculatorPage from "../pages/CalculatorPage";
import CommercialOffer0Page from "../pages/CommercialOffer0Page";
import BillOfQuantitiesPage from "../pages/BillOfQuantitiesPage";
import CommercialOffer1Page from "../pages/CommercialOffer1Page";
import FileImportPage from "../pages/FileImportPage";
import ReferenceBookPage from "../pages/ReferenceBookPage";

function AppRoutes() {
  const { user, loading } = useAppContext();
  if (loading) {
    return <Loader />;
  }
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/confirm-email" element={<ConfirmEmail />} />
      <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
      <Route path="/changepassword" element={<ChangePasswordPage user={user} />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/personalpage" element={user && user.emailconfirmed ? <PersonalPage /> : <Navigate to="/login" />} />
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="servicepage" element={<ServicePage />} />
        <Route path="servicepagebill" element={<ServicePageBill />} />
        <Route path="/management" element={<Management />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="calculator/:id" element={<CalculatorPage />} />
        <Route path="/forms/commercial-offer-0" element={<CommercialOffer0Page />} />
        <Route path="/forms/bill-of-quantities" element={<BillOfQuantitiesPage />} />
        <Route path="/forms/commercial-offer-1" element={<CommercialOffer1Page />} />
        <Route path="/referencebook" element={<ReferenceBookPage />} />
        <Route path="/fileimport" element={<FileImportPage />} />
        <Route path="*" element={<NoPage />} />
      </Route>
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
