import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import Slider from "../components/Slider";
const slides = [
  { title: "Первый слайд", formula: "1" },
  { title: "Второй слайд", formula: "2" },
];
describe("Slider", () => {
  test("Проверка рендера компонента", () => {
    const { container } = render(<Slider title="Привет" slides={slides} />);
    expect(container).toBeInTheDocument();
  });
  test("Проверка рендера первого слаайда", () => {
    render(<Slider title="Привет" slides={slides} />);
    expect(screen.getByText("Первый слайд")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });
  test("Проверка отображения второго слайда после нажатия кнопки", () => {
    const { container } = render(<Slider title="Привет" slides={slides} />);
    const btn = container.querySelectorAll(".slider__button--right");
    fireEvent.click(btn[0]);
    expect(screen.getByText("Второй слайд")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
  test("Проверка работы кнопки назад и отображения последнего слайда", () => {
    const { container } = render(<Slider title="Привет" slides={slides} />);
    const btn = container.querySelectorAll(".slider__button--left");
    fireEvent.click(btn[0]);
    expect(screen.getByText("Второй слайд")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
