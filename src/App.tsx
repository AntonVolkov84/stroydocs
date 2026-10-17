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
import Commercial from "../components/Commercial";
import ReferenceBookPage from "../pages/ReferenceBookPage";
import CompanyProfile from "../components/CompanyProfile";
import SavedCalculators from "../components/SavedCalculators";
import ManageUsers from "../components/ManageUsers";
import CreatingNews from "../components/CreatingNews";
import ConstructorCalculator from "../components/ConstructorCalculator";
import ManageCalculator from "../components/ManageCalculator";
import ManageReferenceBooks from "../components/ManageReferenceBooks";
import SpecificationFormPage from "../pages/SpecificationFormPage";

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
      <Route path="/changepassword" element={<ChangePasswordPage />} />
      <Route path="/register" element={<RegisterPage />} />
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
        <Route path="/forms/specificationformpage" element={<SpecificationFormPage />} />
        <Route path="/referencebook" element={<ReferenceBookPage />} />
        <Route path="/fileimport" element={<FileImportPage />} />
        <Route path="*" element={<NoPage />} />
      </Route>
      <Route path="/personal" element={user && user.emailconfirmed ? <PersonalPage /> : <Navigate to="/login" />}>
        <Route index element={<CompanyProfile />} />
        {/* Сохраненные документы */}
        <Route path="commercial" element={<Commercial />} /> {/* Или оставить /commercial на верхнем уровне */}
        {/* Сохраненные калькуляторы */}
        <Route path="saved-calculators" element={<SavedCalculators />} />
        {/* Админские разделы */}
        <Route path="users" element={<ManageUsers />} />
        <Route path="news" element={<CreatingNews />} />
        <Route path="calculator-create" element={<ConstructorCalculator />} />
        <Route path="calculators" element={<ManageCalculator />} />
        <Route path="reference-books" element={<ManageReferenceBooks />} />
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
