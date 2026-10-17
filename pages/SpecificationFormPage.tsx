import { useNavigate, useLocation } from "react-router-dom";
import SpecificationForm from "../components/SpecificationForm";

export default function SpecificationFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateData = location.state as any;

  return (
    <SpecificationForm
      clearMode={() => navigate("/dashboard")}
      initialRows={stateData?.rows}
      initialTitle={stateData?.title}
      initialOfferId={stateData?.offerId}
      tableOwnerId={stateData?.userId}
      onUpdateSuccess={() => {}}
    />
  );
}
