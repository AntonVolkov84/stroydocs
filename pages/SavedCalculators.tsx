import { useEffect, useState, Fragment } from "react";
import "./SavedCalculators.css";
import { getSaveCalculatorResults, deleteSavedCalculator } from "../services/calculatorService";
import { Payload, SavedCalculatorData } from "../type";
import { useAppContext } from "../services/AppContext";
import Button from "../components/Button";

function SavedCalculators() {
  const [savedCalculatorData, setSavedCalculatorData] = useState<SavedCalculatorData[] | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { user } = useAppContext();

  const getSavedCalculatorData = async () => {
    if (!user) return;
    const userId = user.id;
    const res = await getSaveCalculatorResults(userId);
    setSavedCalculatorData(res);
  };

  const handleDelete = async (id: number | string) => {
    await deleteSavedCalculator(id);
    getSavedCalculatorData();
  };

  const handlePrint = (payload: SavedCalculatorData) => {
    const content = `
      Заголовок: ${payload.title}
      Формула: ${payload.calculator.formula}
      Переменные: ${JSON.stringify(payload.input_values, null, 2)}
      Результат: ${payload.result} ${payload.calculator.result_unit || ""}
    `;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`<pre>${content}</pre>`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  useEffect(() => {
    getSavedCalculatorData();
  }, []);

  return (
    <div className="savedcalculator-container">
      <h2>Сохраненные калькуляторы</h2>
      {savedCalculatorData?.length ? (
        <table className="calculator-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Формула</th>
              <th>Результат</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {savedCalculatorData.map((calc) => (
              <Fragment key={calc.id}>
                <tr>
                  <td>{calc.title}</td>
                  <td>{calc.calculator.formula}</td>
                  <td>
                    {calc.result} {calc.calculator.result_unit}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Button onClick={() => setExpandedId(expandedId === Number(calc.id) ? null : Number(calc.id))}>
                        {expandedId === Number(calc.id) ? "Скрыть" : "Подробнее"}
                      </Button>
                      <Button className="button_btn--red-hover" onClick={() => handleDelete(calc.id)}>
                        Удалить
                      </Button>
                      <Button onClick={() => handlePrint(calc)}>Распечатать</Button>
                    </div>
                  </td>
                </tr>

                {expandedId === calc.id && (
                  <tr>
                    <td colSpan={4}>
                      <div className="details">
                        <strong>Название калькулятора:</strong> {calc.calculator.title}
                        <strong>Формула:</strong> {calc.calculator.formula}
                        <strong>Переменные:</strong>
                        {calc.input_values && typeof calc.input_values === "object" ? (
                          <ul>
                            {Object.entries(calc.input_values).map(([key, value]) => (
                              <li key={key}>
                                {key}: {value}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p>Нет данных о переменных</p>
                        )}
                        <strong>Результат:</strong> {calc.result} {calc.calculator.result_unit}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Нет сохранённых калькуляторов.</p>
      )}
    </div>
  );
}

export default SavedCalculators;
