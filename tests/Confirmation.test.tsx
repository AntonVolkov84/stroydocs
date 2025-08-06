import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import Confirmation from "../components/Confirmation";

describe("Confirmation", () => {
  test("не рендерится, если open = false", () => {
    const { container } = render(
      <Confirmation onCancel={() => {}} open={false} message="Привет" onConfirm={() => {}} />
    );
    expect(container).toBeEmptyDOMElement();
  });
  test("Рендерится и выводит значения, если open = true", () => {
    render(
      <Confirmation
        confirmText="ОК"
        cancelText="Отмена"
        open={true}
        message="Удалить элемент?"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByText("Подтверждение")).toBeInTheDocument();
    expect(screen.getByText("Удалить элемент?")).toBeInTheDocument();
    expect(screen.getByText("ОК")).toBeInTheDocument();
    expect(screen.getByText("Отмена")).toBeInTheDocument();
  });
  test("Проверка вызова функции onConfirm", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <Confirmation
        confirmText="ОК"
        cancelText="Отмена"
        open={true}
        message="Удалить элемент?"
        onConfirm={() => {
          onConfirm();
        }}
        onCancel={() => {
          onCancel();
        }}
      />
    );
    fireEvent.click(screen.getByText("ОК"));
    expect(onConfirm).toHaveBeenCalled();
    fireEvent.click(screen.getByText("Отмена"));
    expect(onCancel).toHaveBeenCalled();
  });
  test("Проверка изменения заголовка при отправке его пропсом", () => {
    render(
      <Confirmation open={true} title="Вы точно уверены?" message="Удалить?" onConfirm={() => {}} onCancel={() => {}} />
    );
    expect(screen.getByText("Вы точно уверены?")).toBeInTheDocument();
    expect(screen.queryByText("Подтверждение")).not.toBeInTheDocument();
  });
});
