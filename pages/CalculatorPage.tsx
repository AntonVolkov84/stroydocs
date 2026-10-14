import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Calculator from "../components/Calculator";
import * as calculatorService from "../services/calculatorService";
import { CalculatorInterface, Mode } from "../type";

export default function CalculatorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [calculator, setCalculator] = useState<CalculatorInterface | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCalc = async () => {
      try {
        const data = await calculatorService.getAllCalculators();
        if (Array.isArray(data)) {
          const found = data.find((c) => String(c.id) === String(id));
          setCalculator(found || null);
        }
      } catch (err) {
        console.error("Ошибка загрузки калькулятора:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCalc();
  }, [id]);

  if (loading) return <div style={{ padding: 20 }}>Загрузка...</div>;
  if (!calculator) return <div style={{ padding: 20 }}>Калькулятор не найден</div>;

  // Имитируем объект mode, который ожидает оригинальный компонент Calculator,
  // а вместо setMode вешаем навигацию назад (например, на главную или к списку)
  const mode: Mode = {
    calculators: calculator,
    form: false,
    form1: false,
    form2: false,
    referencebook: false,
    management: false,
    fileimport: false,
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Calculator
      mode={mode}
      setMode={handleBack as any} // Передаем функцию возврата назад
    />
  );
}
