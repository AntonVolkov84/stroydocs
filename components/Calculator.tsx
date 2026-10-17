import { useState, Dispatch, SetStateAction, useEffect } from "react";
import { useAppContext } from "../services/AppContext";
import "./Calculator.css";
import Button from "./Button";
import { Mode, Payload } from "../type";
import { saveCalculatorResults } from "../services/calculatorService";
import ImageToggle from "./ImageToggle";

interface CalculatorProps {
  mode: Mode;
  setMode?: Dispatch<SetStateAction<Mode>>;
  onApplyResult?: (value: number) => void;
  onBack?: () => void;
}

function Calculator({ mode, setMode, onApplyResult, onBack }: CalculatorProps) {
  const [variableValues, setVariableValues] = useState<Record<string, number>>({});
  const [calcResult, setCalcResult] = useState<number | string | null>(null);
  const [isSaving] = useState<boolean>(false);
  const { user, prompt, alert } = useAppContext();

  const activeCalc = typeof mode.calculators === "object" ? mode.calculators : null;

  useEffect(() => {
    setCalcResult(null);
    setVariableValues({});
  }, [mode]);

  const calculateFormula = (formula: string, variables: Record<string, number>): number | string => {
    try {
      let expression = formula;
      for (const [key, value] of Object.entries(variables)) {
        expression = expression.split(key).join(value.toString());
      }
      return eval(expression);
    } catch (error) {
      return "Ошибка вычисления";
    }
  };

  const handleApplyToForm = () => {
    if (typeof calcResult === "number" && onApplyResult) {
      onApplyResult(calcResult);
    }
  };

  const handleSave = async () => {
    if (!user || !activeCalc) return;
    if (calcResult === null || calcResult === "Ошибка вычисления" || !variableValues) {
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
      calculator: activeCalc,
      variablesValues: variableValues,
      result: calcResult,
      title: title,
      imageUri: activeCalc.image_url,
      imagePublicId: activeCalc.image_public_id,
    };
    try {
      await saveCalculatorResults(payload);
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

  if (!activeCalc) return null;

  return (
    <div className="calculator-container">
      {!user && <h3 style={{ color: "red" }}>Для возможности сохранения рассчетов нужно авторизироваться!</h3>}

      {/* Если передан onBack (из модалки) — вызываем его, иначе старый setMode */}
      <Button
        styled={{
          marginTop: 25,
          display: onBack ? "none" : "block",
        }}
        onClick={() => {
          if (onBack) onBack();
          else if (setMode) setMode((prev) => ({ ...prev, calculators: false }));
        }}
      >
        ← Назад
      </Button>

      <h2 className="calculator-title">{activeCalc.title}</h2>

      {activeCalc.image_url && (
        <div style={{ marginBottom: "20px" }}>
          <ImageToggle src={activeCalc.image_url} alt="Иллюстрация к калькулятору" />
        </div>
      )}

      <p className="calculator-formula">
        Формула: <code>{activeCalc.formula}</code>
      </p>

      <form
        className="calculator-form"
        onSubmit={(e) => {
          e.preventDefault();
          const result = calculateFormula(activeCalc.formula, variableValues);
          setCalcResult(result);
        }}
      >
        {activeCalc.variables?.map((variable: any) => (
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
                  [variable.name]: parseFloat(e.target.value) || 0,
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
          <strong>
            Результат: {calcResult} {activeCalc.result_unit}
          </strong>
          {onApplyResult && typeof calcResult === "number" && (
            <Button onClick={handleApplyToForm} styled={{ marginTop: 10, backgroundColor: "#28a745", width: "35%" }}>
              Вставить в количество
            </Button>
          )}
        </div>
      )}

      {user && (
        <Button disabled={isSaving} onClick={handleSave} styled={{ width: 100, marginTop: 40 }}>
          Сохранить
        </Button>
      )}
    </div>
  );
}

export default Calculator;
