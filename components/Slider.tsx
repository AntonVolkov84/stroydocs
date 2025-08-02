import "./Slider.css";
import { CalculatorInterface } from "../type";
import { useState } from "react";

interface SliderProps {
  calculators: CalculatorInterface[] | null;
}

function Slider({ calculators }: SliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!calculators || calculators.length === 0) return null;
  const currentCalculator = calculators[currentIndex];
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % calculators.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + calculators.length) % calculators.length);
  };
  const backgroundStyle = currentCalculator.image_url
    ? {
        backgroundImage: `url(${currentCalculator.image_url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    : { backgroundColor: "#4289c7" };
  return (
    <div className="slider__container">
      <button className="slider__button slider__button--left" onClick={prevSlide}>
        ◀
      </button>
      <div className="slider__image-wrapper">
        <h2 className="slider__image-wrapper-title">Калькуляторы</h2>
        {calculators && <h3>{calculators[currentIndex].title}</h3>}{" "}
        {calculators && <h4>{calculators[currentIndex].formula}</h4>}
      </div>
      {calculators?.[currentIndex].image_url && (
        <div className="slider__image-block">
          <img
            src={calculators[currentIndex].image_url}
            alt={calculators[currentIndex].title}
            className="slider__image"
          />
        </div>
      )}
      <button className="slider__button slider__button--right" onClick={nextSlide}>
        ▶
      </button>
    </div>
  );
}

export default Slider;
