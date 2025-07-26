import { useState, Dispatch, SetStateAction, useEffect } from "react";
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
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { user, prompt, alert } = useAppContext();

  useEffect(() => {
    setCalcResult(null);
  }, [mode]);

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
    if (!calcResult || !variableValues) {
      return await alert({
        title: "Внимание",
        message: "Нет данных для сохранения!",
      });
    }
    const title = await prompt({
      title: "Придумайте название сохраняемому калькулятору",
      message: "",
      placeholder: "Название",
    });

    if (!title) return;
    const payload: Payload = {
      userId: user.id,
      calculator: mode.calculators,
      variablesValues: variableValues,
      result: calcResult,
      title: title,
      imageUri: mode.calculators.image_url,
      imagePublicId: mode.calculators.image_public_id,
    };
    try {
      saveCalculatorResults(payload);
      await alert({
        title: "Расчёт успешно сохранён!",
        message: "",
      });
    } catch (err) {
      console.error("Ошибка при сохранении расчета:", err);
      await alert({
        title: "Ошибка при сохранении.",
        message: "",
      });
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
          {mode.calculators.image_url && (
            <div style={{ marginBottom: "20px" }}>
              <img
                src={mode.calculators.image_url}
                alt="Иллюстрация к калькулятору"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: "8px",
                  boxShadow: "0 0 8px rgba(0,0,0,0.1)",
                  display: "block",
                  margin: "0 auto",
                }}
              />
            </div>
          )}
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
            <Button disabled={isSaving} onClick={() => handleSave()} styled={{ width: 100, marginTop: 40 }}>
              Сохранить
            </Button>
          )}
        </div>
      )}
    </>
  );
}

export default Calculator;
