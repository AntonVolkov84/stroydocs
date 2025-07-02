import { Link } from "react-router-dom";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  return (
    <div className="dashboard">
      <Link to="/personalpage">Личный кабинет</Link>
    </div>
  );
}
