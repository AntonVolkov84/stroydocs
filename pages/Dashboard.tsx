import { Link } from "react-router-dom";
import * as authServices from "../services/authServices";
import "./Dashboard.css";

export default function Dashboard() {
  return (
    <div className="mainContainer">
      <Link to="/personalpage">Personal</Link>
    </div>
  );
}
