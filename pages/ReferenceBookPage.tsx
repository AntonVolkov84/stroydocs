import { useNavigate } from "react-router-dom";
import ReferenceBook from "../components/ReferenceBook";

export default function ReferenceBookPage() {
  const navigate = useNavigate();

  return <ReferenceBook clearMode={() => navigate("/dashboard")} />;
}
