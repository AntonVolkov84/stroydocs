import "./ManageCalculator.css";
import Button from "./Button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 👈 Добавили роутер
import { delFromStorage } from "../services/cloudinaryService";
import * as calculatorService from "../services/calculatorService";
import { useAppContext } from "../services/AppContext";
import ConstructorCalculator from "./ConstructorCalculator";

export interface Calculator {
  id: number;
  title: string;
  formula: string;
  variables: Record<string, any>;
  author_email: string;
  result_unit: string;
  created_at: string;
  updated_at: string;
  image_url?: string;
  image_public_id?: string;
}

export default function ManageCalculator() {
  const [calculators, setCalculators] = useState<Calculator[] | null>(null);
  const { alert } = useAppContext();
  const navigate = useNavigate();

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

  const removeCalculator = async (id: number, publicId: string) => {
    try {
      if (publicId) await delFromStorage(publicId);
      const result = await calculatorService.deleteCalculator(id);
      fetchCalculators();
      await alert({
        title: result.message,
        message: "",
      });
    } catch (error) {
      console.error("Ошибка при удалении калькулятора:", error);
      await alert({
        title: "Ошибка при удалении калькулятора",
        message: "",
      });
    }
  };

  return (
    <div className="calculator-manager-container">
      <h2 className="calculator-manager-title">Управление калькуляторами</h2>
      <ConstructorCalculator />
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
              <tr key={calc.id}>
                <td>{calc.title}</td>
                <td>{calc.formula}</td>
                <td>{new Date(calc.updated_at).toLocaleDateString()}</td>
                <td>{calc.author_email}</td>
                <td className="calculator-actions">
                  <div className="actions-buttons">
                    <Button
                      onClick={() => {
                        navigate("/personal/calculator-create", {
                          state: { selectedCalculator: calc },
                        });
                      }}
                      className="edit-btn"
                    >
                      Изменить
                    </Button>
                    <Button
                      onClick={() => {
                        removeCalculator(calc.id, calc.image_public_id || "");
                      }}
                      className="button_btn--red-hover"
                    >
                      Удалить
                    </Button>
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
