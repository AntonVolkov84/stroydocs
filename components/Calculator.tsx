import { useState, Dispatch, SetStateAction } from "react";
import { useAppContext } from "../services/AppContext";
import "./Calculator.css";
import Button from "./Button";
import { Mode, Payload } from "../type";
import { saveCalculatorResults } from "../services/calculatorService";
interface CalculatorProps {
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
}
function Calculator({ mode, setMode }: CalculatorProps) {
  const [variableValues, setVariableValues] = useState<Record<string, number>>({});
  const [calcResult, setCalcResult] = useState<number | string | null>(null);
  const { user } = useAppContext();

  const calculateFormula = (formula: string, variables: Record<string, number>): number | string => {
    try {
      let expression = formula;
      for (const [key, value] of Object.entries(variables)) {
        expression = expression.split(key).join(value.toString());
      }
      const result = eval(expression);
      return result;
    } catch (error) {
      return "Ошибка вычисления";
    }
  };
  const handleSave = async () => {
    if (!user || typeof mode.calculators !== "object") return;
    const documentName = prompt("Введите название для сохранения расчета:");
    if (!documentName) return;
    const payload: Payload = {
      userId: user.id,
      calculator: mode.calculators,
      variablesValues: variableValues,
      result: calcResult,
      title: documentName,
    };
    try {
      saveCalculatorResults(payload);
      alert("Расчёт успешно сохранён!");
    } catch (err) {
      console.error("Ошибка при сохранении расчета:", err);
      alert("Ошибка при сохранении.");
    }
  };
  return (
    <>
      {typeof mode.calculators === "object" && (
        <div className="calculator-container">
          {!user && <h3 style={{ color: "red" }}>Для возможности сохранения рассчетов нужно авторизироваться!</h3>}
          <Button styled={{ marginTop: 25 }} onClick={() => setMode((prev) => ({ ...prev, calculators: false }))}>
            ← Назад
          </Button>
          <h2 className="calculator-title">{mode.calculators.title}</h2>
          <p className="calculator-formula">
            Формула: <code>{mode.calculators.formula}</code>
          </p>
          <form
            className="calculator-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (mode.calculators && typeof mode.calculators !== "boolean") {
                const result = calculateFormula(mode.calculators.formula, variableValues);
                setCalcResult(result);
              }
            }}
          >
            {mode.calculators.variables.map((variable) => (
              <div key={variable.name} className="calculator-input-group">
                <label htmlFor={variable.name}>{variable.name}</label>
                <small>{variable.description}</small>
                <input
                  id={variable.name}
                  type="number"
                  step="any"
                  required
                  onChange={(e) =>
                    setVariableValues((prev) => ({
                      ...prev,
                      [variable.name]: parseFloat(e.target.value),
                    }))
                  }
                />
              </div>
            ))}
            <Button typeBtn="submit" styled={{ width: 100 }}>
              Рассчитать
            </Button>
          </form>
          {calcResult !== null && (
            <div className="calculator-result">
              Результат:{" "}
              <strong>
                {calcResult} {mode.calculators.result_unit}
              </strong>
            </div>
          )}
          {user && (
            <Button onClick={() => handleSave()} styled={{ width: 100, marginTop: 40 }}>
              Сохранить
            </Button>
          )}
        </div>
      )}
    </>
  );
}

export default Calculator;
