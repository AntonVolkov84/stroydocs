import { expect, test, describe, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Calculator from "../components/Calculator";

// Просто "фейковые" данные для моков — прямо в фабриках моков, не сверху
vi.mock("../services/AppContext", () => {
  // Все функции создаём здесь, чтобы не было top level переменных
  const alert = vi.fn();
  const prompt = vi.fn().mockResolvedValue("Мой расчет");

  return {
    useAppContext: () => ({
      user: { id: "123" },
      alert,
      prompt,
    }),
  };
});

vi.mock("../services/calculatorService", () => {
  const saveCalculatorResults = vi.fn();
  return {
    saveCalculatorResults,
  };
});

// Импорт мокнутых функций *после* vi.mock (все равно это будут моки)
import { useAppContext } from "../services/AppContext";
import { saveCalculatorResults } from "../services/calculatorService";

// В тестах будем обращаться к мокам через useAppContext() и saveCalculatorResults

describe("Calculator component", () => {
  const setMode = vi.fn();

  beforeEach(() => {
    // Чистим мок-функции перед каждым тестом
    useAppContext().alert.mockClear();
    useAppContext().prompt.mockClear();
    saveCalculatorResults.mockClear();
  });

  test("рендерит заголовок и поля ввода", () => {
    render(
      <Calculator
        mode={{
          calculators: {
            title: "Пример калькулятора",
            formula: "A + B",
            result_unit: "кг",
            variables: [
              { name: "A", description: "Значение A" },
              { name: "B", description: "Значение B" },
            ],
            image_url: "https://example.com/image.jpg",
            image_public_id: "img123",
          },
        }}
        setMode={setMode}
      />
    );
    expect(screen.getByText("Пример калькулятора")).toBeInTheDocument();
    expect(screen.getByLabelText("A")).toBeInTheDocument();
    expect(screen.getByLabelText("B")).toBeInTheDocument();
  });

  test("выполняет расчет при вводе значений и нажатии на кнопку", () => {
    render(
      <Calculator
        mode={{
          calculators: {
            title: "Пример калькулятора",
            formula: "A + B",
            result_unit: "кг",
            variables: [
              { name: "A", description: "Значение A" },
              { name: "B", description: "Значение B" },
            ],
            image_url: "https://example.com/image.jpg",
            image_public_id: "img123",
          },
        }}
        setMode={setMode}
      />
    );
    fireEvent.change(screen.getByLabelText("A"), { target: { value: "5" } });
    fireEvent.change(screen.getByLabelText("B"), { target: { value: "3" } });
    fireEvent.click(screen.getByText("Рассчитать"));
    expect(screen.getByText(/Результат:/)).toHaveTextContent("8 кг");
  });

  test("показывает предупреждение при попытке сохранить без результата", () => {
    render(
      <Calculator
        mode={{
          calculators: {
            title: "Пример калькулятора",
            formula: "A + B",
            result_unit: "кг",
            variables: [
              { name: "A", description: "Значение A" },
              { name: "B", description: "Значение B" },
            ],
            image_url: "https://example.com/image.jpg",
            image_public_id: "img123",
          },
        }}
        setMode={setMode}
      />
    );
    fireEvent.click(screen.getByText("Сохранить"));

    // Проверяем, что alert вызван
    expect(useAppContext().alert).toHaveBeenCalledWith(expect.objectContaining({ title: "Внимание" }));
  });

  test("сохраняет расчет при наличии данных", async () => {
    render(
      <Calculator
        mode={{
          calculators: {
            title: "Пример калькулятора",
            formula: "A + B",
            result_unit: "кг",
            variables: [
              { name: "A", description: "Значение A" },
              { name: "B", description: "Значение B" },
            ],
            image_url: "https://example.com/image.jpg",
            image_public_id: "img123",
          },
        }}
        setMode={setMode}
      />
    );

    fireEvent.change(screen.getByLabelText("A"), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText("B"), { target: { value: "4" } });
    fireEvent.click(screen.getByText("Рассчитать"));

    await screen.findByText("6 кг");

    fireEvent.click(screen.getByText("Сохранить"));

    await waitFor(() => {
      expect(saveCalculatorResults).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Мой расчет",
          result: 6,
        })
      );
    });
  });
});
