import { useState, useEffect, Dispatch, SetStateAction } from "react";
import "./Calculator.css";
import Button from "./Button";
type ModalState<T> = T | false;

interface Variable {
  name: string;
  description: string;
}
interface Calculator {
  id: number;
  title: string;
  formula: string;
  variables: Variable[];
  author_email: string;
  result_unit: string;
  created_at: string;
  updated_at: string;
}
interface Mode {
  calculators: ModalState<Calculator>;
}
interface CalculatorProps {
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
}
function Calculator({ mode, setMode }: CalculatorProps) {
  const [variableValues, setVariableValues] = useState<Record<string, number>>({});
  const [calcResult, setCalcResult] = useState<number | string | null>(null);
  const extractVariables = (formula: string): string[] => {
    const matches = formula.match(/\b[а-яА-ЯёЁa-zA-Z_]+\b/g);
    return matches ? Array.from(new Set(matches)) : [];
  };
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

  return (
    <>
      {typeof mode.calculators === "object" && (
        <div className="calculator-container">
          <Button onClick={() => setMode((prev) => ({ ...prev, calculators: false }))}>← Назад</Button>
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
        </div>
      )}
    </>
  );
}

export default Calculator;
