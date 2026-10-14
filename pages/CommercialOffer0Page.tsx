import { useNavigate, useLocation } from "react-router-dom";
import CommercialOfferForm from "../components/CommercialOfferForm";

export default function CommercialOffer0Page() {
  const navigate = useNavigate();
  const location = useLocation();

  // Если данные переданы через state (например, при редактировании или открытии из личного кабинета)
  const stateData = location.state as any;

  return (
    <CommercialOfferForm
      clearMode={() => navigate("/dashboard")}
      initialRows={stateData?.rows}
      initialTitle={stateData?.title}
      initialOfferId={stateData?.offerId}
      initialTaxRate={stateData?.taxRate}
      tableOwnerId={stateData?.userId}
      onUpdateSuccess={() => navigate("/dashboard")}
      // Переход в ведомость через роутер с передачей данных в state
      setExportedRows={(rows: any) => {
        // Можно сохранить в контекст или передать дальше через navigate state
      }}
    />
  );
}
