import "./ConstructorCalculator.css";
import { useState } from "react";
import Input from "./Input";
import Button from "./Button";

export default function CalculatorConstructor() {
  const [variableCount, setVariableCount] = useState(1);
  const [variableNames, setVariableNames] = useState<string[]>([""]);
  const [formula, setFormula] = useState("");

  const handleVariableChange = (index: number, value: string) => {
    const updated = [...variableNames];
    updated[index] = value;
    setVariableNames(updated);
  };

  const handleVariableCountChange = (value: number) => {
    const count = Math.max(1, value);
    setVariableCount(count);
    const newVars = [...variableNames];
    while (newVars.length < count) newVars.push("");
    while (newVars.length > count) newVars.pop();
    setVariableNames(newVars);
  };

  const handleSave = () => {
    const calculatorData = {
      variables: variableNames,
      formula: formula,
    };
    console.log("Сохраняем калькулятор:", calculatorData);
  };

  return (
    <div className="constructor-container">
      <h2 className="constructor-title">Конструктор калькулятора</h2>

      <div className="form-group">
        <label className="form-label">Количество переменных:</label>
        <Input
          type="number"
          min={1}
          value={variableCount}
          onChange={(e) => handleVariableCountChange(Number(e.target.value))}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Названия переменных:</label>
        {variableNames.map((name, index) => (
          <div className="form-group-input">
            <Input
              key={index}
              placeholder={`Переменная ${index + 1}`}
              value={name}
              onChange={(e) => handleVariableChange(index, e.target.value)}
            />
          </div>
        ))}
      </div>
      <div className="form-group">
        <label className="form-label">Формула расчёта:</label>
        <Input placeholder="например: a + b * c" value={formula} onChange={(e) => setFormula(e.target.value)} />
      </div>
      <div className="form-actions">
        <Button onClick={handleSave}>Сохранить калькулятор</Button>
      </div>
    </div>
  );
}
