import "./ManageReferenceBooks.css";
import React, { useState, useEffect, useRef } from "react";
import Button from "./Button";
import * as cloudinaryServise from "../services/cloudinaryService";
import * as referenceService from "../services/referenceBookService";
import { useAppContext } from "../services/AppContext";
import { RefData, RefDataInput, UploadedImage, ImageType } from "../type";

function ManageReferenceBooks() {
  const [showPreview, setShowPreview] = useState(false);
  const [refChange, setRefChange] = useState<RefData | null>(null);
  const [refData, setRefData] = useState<RefData[] | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { confirm, alert } = useAppContext();

  const [form, setForm] = useState<RefDataInput>({
    title: "",
    text: "",
    textImages: [] as ImageType[],
    tableImages: [] as ImageType[],
  });

  const textInputRef = useRef<HTMLInputElement | null>(null);
  const tableInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const res = await referenceService.getAllReferenceBooks();
    setRefData(res);
  };
  // const handleRemoveImage = async (field: "textImages" | "tableImages", index: number) => {
  //   const image = form[field][index];
  //   if (image instanceof File) {
  //     setForm((prev) => ({
  //       ...prev,
  //       [field]: prev[field].filter((_, i) => i !== index),
  //     }));
  //   } else {
  //     if (image.publicId) {
  //       await cloudinaryServise.delFromStorage(image.publicId);
  //     }
  //     setForm((prev) => ({
  //       ...prev,
  //       [field]: prev[field].filter((_, i) => i !== index),
  //     }));
  //   }
  // };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value } as any);
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>, field: "textImages" | "tableImages") => {
    const files = e.target.files;
    if (!files) return;
    const arr = Array.from(files);
    const valid: File[] = [];
    for (const file of arr) {
      if (file.size > 1048576) {
        await alert({ title: "Файл больше 1 МБ", message: file.name });
        continue;
      }
      valid.push(file);
    }
    setForm((prev) => ({
      ...prev,
      [field]: [...prev[field].filter((f) => !(f instanceof File)), ...valid].slice(0, 3),
    }));
    e.target.value = "";
  };

  const handleSubmit = async () => {
    setIsUpdating(true);
    try {
      const textImages: UploadedImage[] = [];
      const tableImages: UploadedImage[] = [];
      for (const file of form.textImages) {
        if (file instanceof File) {
          const uploaded = await cloudinaryServise.uploadImageToCloudinary(file);
          if (uploaded) {
            textImages.push({ url: uploaded.url, publicId: uploaded.publicId });
          }
        } else {
          textImages.push(file);
        }
      }
      for (const file of form.tableImages) {
        if (file instanceof File) {
          const uploaded = await cloudinaryServise.uploadImageToCloudinary(file);
          if (uploaded) {
            tableImages.push({ url: uploaded.url, publicId: uploaded.publicId });
          }
        } else {
          tableImages.push(file);
        }
      }

      const newRef = {
        title: form.title,
        text: form.text,
        textImages,
        tableImages,
      };
      const response = refChange
        ? await referenceService.updateReferenceBook(refChange.id, newRef)
        : await referenceService.createReferenceBook(newRef);

      if (response.ok) {
        await alert({ title: response.message, message: "" });
        setForm({ title: "", text: "", textImages: [], tableImages: [] });
        setRefChange(null);
        getData();
        setShowPreview(false);
      } else {
        await alert({ title: "Ошибка", message: "" });
      }
    } catch (err) {
      console.error(err);
      await alert({ title: "Ошибка при сохранении", message: "" });
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteRef = async (id: number, textImages: { publicId: string }[], tableImages: { publicId: string }[]) => {
    const confirmResult = await confirm({
      title: "Удаление",
      message: "Удалить справочник и связанные изображения?",
      confirmText: "Да",
      cancelText: "Нет",
    });
    if (!confirmResult) return;
    try {
      for (const img of textImages) {
        if (img.publicId) {
          await cloudinaryServise.delFromStorage(img.publicId);
        }
      }
      for (const img of tableImages) {
        if (img.publicId) {
          await cloudinaryServise.delFromStorage(img.publicId);
        }
      }
      await referenceService.removeReferenceBook(id);
      getData();
    } catch (err) {
      console.error("Ошибка при удалении справочника:", err);
      await alert({
        title: "Ошибка при удалении справочника",
        message: "",
      });
    }
  };

  const removeAllImages = async (field: "textImages" | "tableImages") => {
    const imagesToDelete = form[field].filter((img) => !(img instanceof File));
    try {
      for (const img of imagesToDelete) {
        if (img.publicId) await cloudinaryServise.delFromStorage(img.publicId);
      }
      setForm((prev) => ({
        ...prev,
        [field]: [],
      }));
    } catch (err) {
      console.error("Ошибка при удалении изображений:", err);
      await alert({ title: "Ошибка при удалении изображений", message: "" });
    }
  };

  return (
    <div className="managereferencebooks__container">
      <h2 className="managereferencebooks__title">Создание справочника</h2>
      <input
        name="title"
        type="text"
        placeholder="Название справочника"
        className="managereferencebooks__input"
        value={form.title}
        onChange={handleChange}
      />
      <textarea
        name="text"
        placeholder="Текст"
        className="managereferencebooks__textarea"
        value={form.text}
        onChange={handleChange}
      />

      <div className="upload-block">
        <label>Изображения для текста (до 3):</label>
        <input
          ref={textInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFiles(e, "textImages")}
        />
        <div className="preview-row">
          {form.textImages.map((file, idx) => {
            const src = file instanceof File ? URL.createObjectURL(file) : file.url;
            return <img key={idx} src={src} alt="preview" />;
          })}
        </div>
        {form.textImages.length > 0 && (
          <Button
            className="button_btn--red-hover"
            styled={{ maxWidth: "150px" }}
            onClick={() => removeAllImages("textImages")}
            typeBtn="button"
          >
            Удалить все картинки
          </Button>
        )}
      </div>

      <div className="upload-block">
        <label>Изображения для таблиц (до 3):</label>
        <input
          ref={tableInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFiles(e, "tableImages")}
        />
        <div className="preview-row">
          {form.tableImages.map((file, idx) => {
            const src = file instanceof File ? URL.createObjectURL(file) : file.url;
            return <img key={idx} src={src} alt="preview" />;
          })}
        </div>
        {form.textImages.length > 0 && (
          <Button
            className="button_btn--red-hover"
            styled={{ maxWidth: "150px" }}
            onClick={() => removeAllImages("tableImages")}
            typeBtn="button"
          >
            Удалить все таблицы
          </Button>
        )}
      </div>

      <Button styled={{ maxWidth: "100px" }} onClick={() => setShowPreview(true)}>
        Превью
      </Button>

      <Button
        disabled={isUpdating}
        typeBtn="submit"
        styled={{ alignSelf: "center", maxWidth: "180px" }}
        onClick={handleSubmit}
      >
        {isUpdating
          ? refChange
            ? "Обновление..."
            : "Создание..."
          : refChange
          ? "Изменить справочник"
          : "Создать справочник"}
      </Button>

      {showPreview && (
        <div className="managereferencebooks__modal">
          <div className="managereferencebooks__modal-content">
            <h3 className="preview-title">{form.title || "Без названия"}</h3>
            <div className="preview-container">
              <div className="text-images-row">
                {form.textImages.map((file, idx) => {
                  const src = file instanceof File ? URL.createObjectURL(file) : file.url;
                  return <img key={idx} src={src} alt="preview" />;
                })}
              </div>
              <p className="preview-text">{form.text || "Нет текста"}</p>
              <div className="table-images-column">
                {form.tableImages.map((file, idx) => {
                  const src = file instanceof File ? URL.createObjectURL(file) : file.url;
                  return <img key={idx} src={src} alt="table" />;
                })}
              </div>
            </div>
            <Button onClick={() => setShowPreview(false)} className="button_btn--red-hover">
              Закрыть предпросмотр
            </Button>
          </div>
        </div>
      )}

      <h2 className="managereferencebooks__subtitle">Список справочников</h2>
      <table className="managereferencebooks__table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Дата изменения</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {refData &&
            refData.map((item) => (
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
                <td>
                  <div className="ref-actions">
                    <Button
                      onClick={() => {
                        setRefChange(item);
                        setForm({
                          title: item.title,
                          text: item.text,
                          textImages: item.textImages,
                          tableImages: item.tableImages,
                        });
                      }}
                      className="edit-btn"
                    >
                      Изменить
                    </Button>
                    <Button
                      onClick={() => deleteRef(item.id, item.textImages, item.tableImages)}
                      className="button_btn--red-hover"
                    >
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

export default ManageReferenceBooks;
