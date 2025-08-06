import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import CommercialOfferForm from "../components/CommercialOfferForm";
import { AppProvider } from "../services/AppContext";
import { useAppContext } from "../services/AppContext";
import { AppContext } from "../services/AppContext";

describe("Confirmation", () => {
  test("Не передан инитиал - отрендаривается одна строка", () => {
    const { container } = render(
      <AppProvider>
        <CommercialOfferForm />
      </AppProvider>
    );
    const rows = container.querySelectorAll("tbody tr");
    expect(rows.length).toBe(9);
  });
  test("Добавлена строка после нажатия на кнопку Добавить материалы", () => {
    const { container } = render(
      <AppProvider>
        <CommercialOfferForm />
      </AppProvider>
    );
    fireEvent.click(screen.getByText("Добавить: материалы"));
    const rows = container.querySelectorAll("tbody tr");
    expect(rows.length).toBe(10);
  });
  test("Проверка удаления строки", () => {
    const { container } = render(
      <AppProvider>
        <CommercialOfferForm />
      </AppProvider>
    );
    fireEvent.click(screen.getByText("Добавить: материалы"));
    fireEvent.click(screen.getByText("Добавить: работы"));
    const button = container.querySelectorAll(".icon-button-del");
    fireEvent.click(button[0]);
    const rows = container.querySelectorAll("tbody tr");
    expect(rows.length).toBe(10);
  });
  test("Можно ввести значение в поле строки", () => {
    render(
      <AppProvider>
        <CommercialOfferForm />
      </AppProvider>
    );

    fireEvent.click(screen.getByText("Добавить: материалы"));
    const input = screen.getAllByRole("textbox")[0];
    fireEvent.change(input, { target: { value: "Новая позиция" } });
    expect(input).toHaveValue("Новая позиция");
  });
});
