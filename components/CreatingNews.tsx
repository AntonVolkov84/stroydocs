import "./CreatingNews.css";
import React, { useState, useEffect, useRef } from "react";
import Button from "./Button";
import * as cloudinaryServise from "../services/cloudinaryService";
import * as newsServise from "../services/newsServise";
import { useAppContext } from "../services/AppContext";
interface NewData {
  title: string;
  text: string;
  imageUrl: string;
  imagePublicId: string;
}
interface NewsData {
  author_email: string;
  created_at: string;
  id: number;
  imageurl: string;
  text: string;
  title: string;
  updated_at: string;
  imagepublicid?: string;
}
interface ChangeArticle extends NewsData {
  imagepublicid: string;
}

function CreatingNews() {
  const [showPreview, setShowPreview] = useState(false);
  const [articleChange, setArticleChange] = useState<NewsData | null>(null);
  const [newsData, setNewsData] = useState<NewsData[] | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const { confirm, alert } = useAppContext();
  const [form, setForm] = useState({
    title: "",
    text: "",
    image: null as File | null,
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const res = await newsServise.getAllNews();
    setNewsData(res);
  };
  const handlePreview = () => setShowPreview(true);
  const handleClosePreview = () => setShowPreview(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1048576) {
      await alert({
        title: "Размер файла не должен превышать 1 МБ",
        message: "",
      });

      return;
    }
    if (e.target.files && e.target.files[0]) {
      setForm({ ...form, image: e.target.files[0] });
    }
  };

  const handleSubmit = async () => {
    setIsUpdating(true);
    try {
      let imageUrl = "";
      let imagePublicId = "";
      if (form.image) {
        const uploadResult = await cloudinaryServise.uploadImageToCloudinary(form.image);
        if (!uploadResult) {
          await alert({
            title: "Ошибка при загрузке изображения",
            message: "",
          });
          return;
        }
        imageUrl = uploadResult.url;
        imagePublicId = uploadResult.publicId;
      }
      const newData: NewData = {
        title: form.title,
        text: form.text,
        imageUrl,
        imagePublicId,
      };
      const response = await newsServise.createNew(newData);
      if (response.ok) {
        await alert({
          title: `${response.message}`,
          message: "",
        });
        getData();
        setForm({ title: "", text: "", image: null });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setShowPreview(false);
      } else {
        const res = await cloudinaryServise.delFromStorage(imagePublicId);
        if (res.success) {
          await alert({
            title: "Файл удален из хранилища",
            message: "",
          });
        } else {
          await alert({
            title: "Не удалось удалить загруженный файл",
            message: "",
          });
        }
      }
    } catch (error) {
      console.error("Ошибка при сабмите:", error);
      await alert({
        title: "Произошла ошибка при создании новости",
        message: "",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  const deleteNew = async (id: number, publicId: string | undefined) => {
    if (publicId) {
      await cloudinaryServise.delFromStorage(publicId);
    }
    const confirmResult = await confirm({
      title: "Удаление",
      message: "Вы уверены, что нужно удалить новость?",
      confirmText: "Да",
      cancelText: "Нет",
    });
    if (confirmResult) {
      await newsServise.deleteNew(id);
    }
    setForm({ title: "", text: "", image: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    getData();
  };
  const handleChangeArticle = async () => {
    if (!articleChange) return;
    setIsUpdating(true);
    const latestPublicId = articleChange.imagepublicid;
    let imageUrl;
    let imagePublicId;
    try {
      if (form.image && latestPublicId) {
        const uploaded = await cloudinaryServise.uploadImageToCloudinary(form.image);
        if (!uploaded) {
          await alert({
            title: "Ошибка при загрузке изображения",
            message: "",
          });
          return;
        }
        imageUrl = uploaded.url;
        imagePublicId = uploaded.publicId;
        await cloudinaryServise.delFromStorage(latestPublicId);
      }
      const updatedNews = {
        title: form.title,
        text: form.text,
        imageUrl,
        imagePublicId,
      };
      const response = await newsServise.updateNew(articleChange.id, updatedNews);
      if (response.message === "Новость успешно обновлена") {
        await alert({
          title: "Новость успешно обновлена",
          message: "",
        });
        setArticleChange(null);
        setForm({ title: "", text: "", image: null });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setArticleChange(null);
        getData();
      } else {
        await alert({
          title: "Ошибка при обновлении",
          message: "",
        });
      }
    } catch (error) {
      console.error("Ошибка при обновлении новости:", error);
      await alert({
        title: "Ошибка при обновлении новости",
        message: "",
      });
    } finally {
      setIsUpdating(false);
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
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="creatingnews__file"
      />
      <Button styled={{ maxWidth: "100px" }} onClick={handlePreview}>
        Превью
      </Button>
      {articleChange ? (
        <Button
          disabled={isUpdating}
          typeBtn="submit"
          styled={{ alignSelf: "center", maxWidth: "150px" }}
          onClick={handleChangeArticle}
        >
          {isUpdating ? "Обновление..." : "Изменить статью"}
        </Button>
      ) : (
        <Button
          disabled={isUpdating}
          typeBtn="submit"
          styled={{ alignSelf: "center", maxWidth: "150px" }}
          onClick={handleSubmit}
        >
          {isUpdating ? "Публикую..." : "Создать новость"}
        </Button>
      )}

      {showPreview && (
        <div className="creatingnews__modal">
          <div className="creatingnews__modal-content">
            <h3>{form.title || "Без заголовка"}</h3>
            <div className="creatingnews__modal-info">
              {form.image ? (
                <img src={URL.createObjectURL(form.image)} alt="preview" className="creatingnews__img" />
              ) : (
                articleChange?.imageurl && (
                  <img src={articleChange.imageurl} alt="preview" className="creatingnews__img" />
                )
              )}
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
            <th>Текст</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {newsData &&
            newsData.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>
                  {new Date(item.updated_at).toLocaleString("ru-RU", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="news-text-cell">{item.text}</td>
                <td>
                  <div className="news-actions">
                    <Button
                      onClick={() => {
                        setArticleChange(item);
                        setForm({
                          title: item.title,
                          text: item.text,
                          image: null,
                        });
                        console.log(item);
                      }}
                      className="edit-btn"
                    >
                      Изменить
                    </Button>
                    <Button onClick={() => deleteNew(item.id, item.imagepublicid)} className="button_btn--red-hover">
                      Удалить
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default CreatingNews;
