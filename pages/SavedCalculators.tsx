import { useEffect, useState } from "react";
import "./SavedCalculators.css";
import { getSaveCalculatorResults } from "../services/calculatorService";
import { Payload } from "../type";
import { useAppContext } from "../services/AppContext";

function SavedCalculators() {
  const [savedCalculatorData, setSavedCalculatorData] = useState<Payload[] | null>(null);
  const { user } = useAppContext();

  const getSavedCalculatorData = async () => {
    if (!user) return;
    const userId = user.id;
    const res = await getSaveCalculatorResults(userId);
    console.log(res);
    setSavedCalculatorData(res);
  };

  useEffect(() => {
    getSavedCalculatorData();
  }, []);
  return <div className="savedcalculator-container">SavedCalculators</div>;
}

export default SavedCalculators;
