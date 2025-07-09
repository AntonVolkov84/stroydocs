import "./NoPage.css";
import catImage from "../src/unsplash.jpg";

export default function NoPage() {
  return (
    <div className="no-page">
      <img src={catImage} alt="Hacker Cat" className="no-page__image" />
      <h1 className="no-page__code">404</h1>
      <p className="no-page__message">Страница недоступна</p>
    </div>
  );
}
