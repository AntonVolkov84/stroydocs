import { useNavigate, useLocation } from "react-router-dom";
import BillOfQuantitiesForm from "../components/BillOfQuantities"; // Путь к твоему компоненту формы ведомости

export default function BillOfQuantitiesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateData = location.state as any;

  return (
    <BillOfQuantitiesForm
      clearMode={() => navigate("/dashboard")}
      initialRows={stateData?.rows}
      initialTitle={stateData?.title}
      initialOfferId={stateData?.offerId}
      tableOwnerId={stateData?.userId}
      onUpdateSuccess={() => {}}
    />
  );
}
