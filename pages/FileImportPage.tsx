import { useNavigate } from "react-router-dom";
import Fileimport from "../components/Fileimport"; // Путь к твоему компоненту импорта

export default function FileImportPage() {
  const navigate = useNavigate();

  return <Fileimport clearMode={() => navigate("/dashboard")} />;
}
