import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import AlertModal from "../components/AlertModal";

describe("AlertModal", () => {
  test("не рендерится, если open = false", () => {
    const { container } = render(<AlertModal open={false} message="Привет" onConfirm={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
  test("показывает сообщение и заголовок, когда open = true", () => {
    render(<AlertModal open={true} message="Тестовое сообщение" title="Заголовок" onConfirm={() => {}} />);
    expect(screen.getByText("Тестовое сообщение")).toBeInTheDocument();
    expect(screen.getByText("Заголовок")).toBeInTheDocument();
  });
  test("показывает кнопку с confirmText и вызывает onConfirm при клике", () => {
    const onConfirmMock = vi.fn();
    render(<AlertModal open={true} message="Сообщение" onConfirm={onConfirmMock} confirmText="Подтвердить" />);
    const button = screen.getByRole("button", { name: "Подтвердить" });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onConfirmMock).toHaveBeenCalledTimes(1);
  });
  test("по умолчанию кнопка имеет текст 'ОК'", () => {
    render(<AlertModal open={true} message="Сообщение" onConfirm={() => {}} />);
    expect(screen.getByRole("button", { name: "ОК" })).toBeInTheDocument();
  });
});
