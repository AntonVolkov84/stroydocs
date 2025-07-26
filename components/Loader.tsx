import "./Loader.css";

const Loader = () => {
  return (
    <div className="loader-overlay">
      <div className="loader-container">
        <div className="loader-text">Загрузка...</div>
        <div className="loader-spinner" />
      </div>
    </div>
  );
};

export default Loader;
