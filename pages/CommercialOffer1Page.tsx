import { useNavigate, useLocation } from "react-router-dom";
import SecondCommercialOfferForm from "../components/SecondCommercialOfferForm";

export default function CommercialOffer1Page() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateData = location.state as any;

  return (
    <SecondCommercialOfferForm
      clearMode={() => navigate("/dashboard")}
      initialRows={stateData?.rows}
      initialTitle={stateData?.title}
      initialOfferId={stateData?.offerId}
      initialTaxRate={stateData?.taxRate}
      tableOwnerId={stateData?.userId}
      onUpdateSuccess={() => navigate("/dashboard")}
      setExportedRows={(data: any) => {
        // Если из Формы 1 экспортируют в Форму 0 или в Ведомость,
        // мы можем перехватить данные и отправить их через navigate state на нужный роут
        if (data.taxRate !== undefined) {
          // Это экспорт в Форму 0
          navigate("/forms/commercial-offer-0", { state: data });
        } else {
          // Это экспорт в Ведомость
          navigate("/forms/bill-of-quantities", { state: { rows: data } });
        }
      }}
    />
  );
}
