import "./CreatingNews.css";
import React, { useState } from "react";
import Button from "./Button";
import * as cloudinaryServise from "../services/cloudinaryService";
import * as newsServise from "../services/newsServise";
interface NewsData {
  title: string;
  text: string;
  imageUrl: string;
  imagePublicId: string;
}
function CreatingNews() {
  const [showPreview, setShowPreview] = useState(false);
  const [form, setForm] = useState({
    title: "",
    text: "",
    image: null as File | null,
  });

  const handlePreview = () => setShowPreview(true);
  const handleClosePreview = () => setShowPreview(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1048576) {
      alert("Размер файла не должен превышать 1 МБ");
      return;
    }
    if (e.target.files && e.target.files[0]) {
      setForm({ ...form, image: e.target.files[0] });
    }
  };

  const handleSubmit = async () => {
    try {
      let imageUrl = "";
      let imagePublicId = "";
      if (form.image) {
        const uploadResult = await cloudinaryServise.uploadImageToCloudinary(form.image);
        if (!uploadResult) {
          alert("Ошибка при загрузке изображения");
          return;
        }
        imageUrl = uploadResult.url;
        imagePublicId = uploadResult.publicId;
      }
      const newsData: NewsData = {
        title: form.title,
        text: form.text,
        imageUrl,
        imagePublicId,
      };
      const response = await newsServise.createNew(newsData);
      if (response.ok) {
        alert(`${response.message}`);
        setForm({ title: "", text: "", image: null });
        setShowPreview(false);
      } else {
        const res = await cloudinaryServise.delFromStorage(imagePublicId);
        if (res.success) {
          alert("Файл удален из хранилища");
        } else {
          alert("Не удалось удалить загруженный файл");
        }
      }
    } catch (error) {
      console.error("Ошибка при сабмите:", error);
      alert("Произошла ошибка при создании новости");
    }
  };

  return (
    <div className="creatingnews__container">
      <h2 className="creatingnews__title">Создание новости</h2>
      <input
        name="title"
        type="text"
        placeholder="Заголовок новости"
        className="creatingnews__input"
        value={form.title}
        onChange={handleChange}
      />
      <textarea
        name="text"
        placeholder="Основной текст"
        className="creatingnews__textarea"
        value={form.text}
        onChange={handleChange}
      />
      <input type="file" accept="image/*" onChange={handleImageChange} className="creatingnews__file" />
      <Button styled={{ maxWidth: "100px" }} onClick={handlePreview}>
        Превью
      </Button>
      <Button typeBtn="submit" styled={{ alignSelf: "center", maxWidth: "150px" }} onClick={handleSubmit}>
        Создать новость
      </Button>

      {showPreview && (
        <div className="creatingnews__modal">
          <div className="creatingnews__modal-content">
            <h3>{form.title || "Без заголовка"}</h3>
            <div className="creatingnews__modal-info">
              {form.image && <img src={URL.createObjectURL(form.image)} alt="preview" className="creatingnews__img" />}
              <p>{form.text || "Нет текста"}</p>
            </div>
            <Button onClick={handleClosePreview} className="button_btn--red-hover">
              Закрыть предпросмотр
            </Button>
          </div>
        </div>
      )}

      <h2 className="creatingnews__subtitle">Список новостей</h2>
      <table className="creatingnews__table">
        <thead>
          <tr>
            <th>Заголовок</th>
            <th>Дата</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Пример новости</td>
            <td>10.07.2025</td>
            <td>
              <div className="news-actions">
                <Button className="edit-btn">Изменить</Button>
                <Button className="button_btn--red-hover">Удалить</Button>
              </div>
            </td>
          </tr>
          {/* Здесь будут рендериться реальные данные */}
        </tbody>
      </table>
    </div>
  );
}

export default CreatingNews;
