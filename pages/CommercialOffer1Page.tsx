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
      onUpdateSuccess={() => {}}
    />
  );
}
