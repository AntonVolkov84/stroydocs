/// <reference types="vitest" />
import { expect, test, describe, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "../components/Button";

describe("Button component", () => {
  test("отображает текст", () => {
    render(<Button>Нажми меня</Button>);
    expect(screen.getByRole("button")).toHaveTextContent("Нажми меня");
  });

  test("вызывает onClick при клике", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Клик</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("не вызывает onClick, если disabled", () => {
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} disabled>
        Кнопка
      </Button>
    );
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  test("устанавливает правильный type", () => {
    render(<Button typeBtn="submit">Отправить</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });
});
