import "./ManageCalculator.css";
import Button from "./Button";
import { useEffect, useState } from "react";
import * as calculatorService from "../services/calculatorService";
export interface Calculator {
  id: number;
  title: string;
  formula: string;
  variables: Record<string, any>;
  author_email: string;
  result_unit: string;
  created_at: string;
  updated_at: string;
}
export default function ManageCalculator() {
  const [calculators, setCalculators] = useState<Calculator[] | null>(null);
  console.log(calculators);
  const fetchCalculators = async (): Promise<void> => {
    try {
      const data = await calculatorService.getAllCalculators();
      setCalculators(data);
    } catch (err) {
      console.error("Ошибка при получении калькуляторов", err);
    }
  };
  useEffect(() => {
    fetchCalculators();
  }, []);
  return (
    <div className="calculator-manager-container">
      <h2 className="calculator-manager-title">Управление калькуляторами</h2>
      <div className="calculator-table-wrapper">
        <table className="calculator-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Формула</th>
              <th>Дата обновления</th>
              <th>Автор</th>
              <th className="actions-header">Действия</th>
            </tr>
          </thead>
          <tbody>
            {calculators?.map((calc) => (
              <tr>
                <td>{calc.title}</td>
                <td>{calc.formula}</td>
                <td>{new Date(calc.updated_at).toLocaleDateString()}</td>
                <td>{calc.author_email}</td>
                <td className="calculator-actions">
                  <div className="actions-buttons">
                    <Button className="edit-btn">Изменить</Button>
                    <Button className="button_btn--red-hover">Удалить</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
