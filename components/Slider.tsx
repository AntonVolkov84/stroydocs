import "./Slider.css";
import { Slide } from "../type";
import { useState, useRef } from "react";
import ImageCalculator from "../src/unsplash.jpg";

interface SliderProps {
  slides: Slide[] | null;
  title: string;
}

function Slider({ slides, title }: SliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const startXRef = useRef<number | null>(null);

  if (!slides || slides.length === 0) return null;
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };
  const handleMouseDown = (e: React.MouseEvent) => {
    startXRef.current = e.clientX;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (startXRef.current === null) return;

    const delta = e.clientX - startXRef.current;
    if (delta > 50) {
      prevSlide();
    } else if (delta < -50) {
      nextSlide();
    }
    startXRef.current = null;
  };
  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startXRef.current === null) return;

    const delta = e.changedTouches[0].clientX - startXRef.current;
    if (delta > 50) {
      prevSlide();
    } else if (delta < -50) {
      nextSlide();
    }
    startXRef.current = null;
  };
  const imageSrc = slides?.[currentIndex]?.image_url ? slides[currentIndex].image_url : ImageCalculator;
  return (
    <div
      className="slider__container"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <h2 className="slider__title">{title}</h2>
      <div className="slider__content">
        <button className="slider__button slider__button--left" onClick={prevSlide}>
          ◀
        </button>
        <div className="slider__image-wrapper">
          {slides && <h3>{slides[currentIndex].title}</h3>}
          {slides && <h4>{slides[currentIndex].formula}</h4>}
        </div>
        {slides && (
          <div className="slider__image-block">
            <img src={imageSrc} alt={slides[currentIndex].title} className="slider__image" />
          </div>
        )}
        <button className="slider__button slider__button--right" onClick={nextSlide}>
          ▶
        </button>
      </div>
    </div>
  );
}

export default Slider;
