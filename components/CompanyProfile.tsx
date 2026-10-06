import React, { useState, useEffect } from "react";
import axios from "axios";
import Button from "./Button";
import { useAppContext } from "../services/AppContext";
import "./CompanyProfile.css";

const apiUrl: string = import.meta.env.VITE_API_URL;

export interface CompanyData {
  id?: number;
  userId?: number;
  name: string;
  address: string;
  isVatPayer: boolean;
  vatRate: string;
}

const STANDARD_VAT_RATES = ["5%", "7%", "10%", "22%"];

function CompanyProfile() {
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { confirm } = useAppContext();

  // Состояние пошаговой формы
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<CompanyData>({
    name: "",
    address: "",
    isVatPayer: false,
    vatRate: "22%",
  });
  const [customVat, setCustomVat] = useState<string>("");
  const [isCustomVatSelected, setIsCustomVatSelected] = useState<boolean>(false);

  // Загрузка данных предприятия
  const fetchCompany = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/stroydocs/company`, {
        withCredentials: true,
      });

      if (res.data && res.data.company) {
        const comp = res.data.company;
        setCompany(comp);
        setFormData(comp);

        if (comp.vatRate && !STANDARD_VAT_RATES.includes(comp.vatRate)) {
          setIsCustomVatSelected(true);
          setCustomVat(comp.vatRate);
        } else {
          setIsCustomVatSelected(false);
        }
      } else {
        setCompany(null);
      }
    } catch (error) {
      console.error("Ошибка при загрузке предприятия:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const handleVatRateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "custom") {
      setIsCustomVatSelected(true);
      setFormData((prev) => ({ ...prev, vatRate: customVat || "" }));
    } else {
      setIsCustomVatSelected(false);
      setFormData((prev) => ({ ...prev, vatRate: val }));
    }
  };

  const handleCustomVatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomVat(val);
    setFormData((prev) => ({ ...prev, vatRate: val }));
  };

  // Сохранение (POST для создания, PATCH для обновления)
  const handleSubmit = async () => {
    try {
      const finalVatRate = formData.isVatPayer ? (isCustomVatSelected ? customVat : formData.vatRate) : "";

      const payload = {
        name: formData.name,
        address: formData.address,
        isVatPayer: formData.isVatPayer,
        vatRate: finalVatRate,
      };

      if (company?.id) {
        // Обновление существующего предприятия
        await axios.patch(`${apiUrl}/stroydocs/company`, payload, {
          withCredentials: true,
        });
      } else {
        // Создание нового
        await axios.post(`${apiUrl}/stroydocs/company`, payload, {
          withCredentials: true,
        });
      }

      await fetchCompany();
      setIsEditing(false);
      setStep(1);
    } catch (error) {
      console.error("Ошибка при сохранении предприятия:", error);
      alert("Не удалось сохранить данные предприятия.");
    }
  };

  // Удаление предприятия
  const handleDelete = async () => {
    const confirmResult = await confirm({
      title: "Удалить сохраненные данные о предприятии?",
      message: "Вы уверены, оно будет стерто из Ваших сохранений?",
      confirmText: "Да",
      cancelText: "Нет",
    });
    if (!confirmResult) return;
    if (confirmResult) {
      try {
        await axios.delete(`${apiUrl}/stroydocs/company`, {
          withCredentials: true,
        });
        setCompany(null);
        setFormData({
          name: "",
          address: "",
          isVatPayer: false,
          vatRate: "22%",
        });
        setIsEditing(false);
        setStep(1);
      } catch (error) {
        console.error("Ошибка при удалении предприятия:", error);
        alert("Не удалось удалить предприятие.");
      }
    }
  };

  const handleStartEdit = () => {
    if (company) {
      setFormData(company);
      if (company.vatRate && !STANDARD_VAT_RATES.includes(company.vatRate)) {
        setIsCustomVatSelected(true);
        setCustomVat(company.vatRate);
      } else {
        setIsCustomVatSelected(false);
      }
    }
    setIsEditing(true);
    setStep(1);
  };

  if (loading) {
    return <div className="company-profile__loading">Проверка данных о предприятии...</div>;
  }

  // РЕЖИМ 1: Отображение закрепленного предприятия
  if (company && !isEditing) {
    return (
      <div className="company-card">
        <div className="company-card__header">
          <h3 className="company-card__title">Закреплённое предприятие</h3>
          <div className="company-card__actions">
            <Button onClick={handleStartEdit}>Изменить</Button>
            <Button onClick={handleDelete}>Удалить</Button>
          </div>
        </div>

        <div className="company-card__body">
          <div className="company-card__row">
            <span className="company-card__label">Наименование:</span>
            <span className="company-card__value">{company.name}</span>
          </div>

          <div className="company-card__row">
            <span className="company-card__label">Адрес:</span>
            <span className="company-card__value">{company.address || "Не указан"}</span>
          </div>

          <div className="company-card__row">
            <span className="company-card__label">Плательщик НДС:</span>
            <span
              className={`company-card__badge ${
                company.isVatPayer ? "company-card__badge--active" : "company-card__badge--inactive"
              }`}
            >
              {company.isVatPayer ? "Да" : "Нет"}
            </span>
          </div>

          {company.isVatPayer && (
            <div className="company-card__row">
              <span className="company-card__label">Ставка НДС:</span>
              <span className="company-card__value company-card__value--highlight">
                {company.vatRate || "Не указана"}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // РЕЖИМ 2: Пошаговая форма (Мастер из 3 шагов)
  return (
    <div className="company-wizard">
      <div className="company-wizard__header">
        <h3 className="company-wizard__title">{company ? "Редактирование предприятия" : "Закрепление предприятия"}</h3>

        <div className="company-wizard__steps">
          <div className={`company-wizard__step ${step >= 1 ? "company-wizard__step--active" : ""}`}>1. Название</div>
          <div className={`company-wizard__step ${step >= 2 ? "company-wizard__step--active" : ""}`}>2. Адрес</div>
          <div className={`company-wizard__step ${step >= 3 ? "company-wizard__step--active" : ""}`}>
            3. Налогообложение
          </div>
        </div>
      </div>

      <div className="company-wizard__body">
        {/* Шаг 1 */}
        {step === 1 && (
          <div className="company-wizard__group">
            <label className="company-wizard__label">Наименование предприятия / организации:</label>
            <input
              type="text"
              className="company-wizard__input"
              placeholder='Например: ООО "СтройСервис" или ИП Иванов'
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
        )}

        {/* Шаг 2 */}
        {step === 2 && (
          <div className="company-wizard__group">
            <label className="company-wizard__label">Юридический / фактический адрес:</label>
            <textarea
              className="company-wizard__textarea"
              placeholder="Введите адрес организации..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        )}

        {/* Шаг 3 */}
        {step === 3 && (
          <div className="company-wizard__group">
            <label className="company-wizard__checkbox-label">
              <input
                type="checkbox"
                checked={formData.isVatPayer}
                onChange={(e) => setFormData({ ...formData, isVatPayer: e.target.checked })}
              />
              Предприятие является плательщиком НДС
            </label>

            {formData.isVatPayer && (
              <div className="company-wizard__vat-box">
                <label className="company-wizard__label">Выберите ставку НДС:</label>
                <select
                  className="company-wizard__select"
                  value={isCustomVatSelected ? "custom" : formData.vatRate}
                  onChange={handleVatRateChange}
                >
                  <option value="5%">5%</option>
                  <option value="7%">7%</option>
                  <option value="10%">10%</option>
                  <option value="22%">22%</option>
                  <option value="custom">Свой вариант...</option>
                </select>

                {isCustomVatSelected && (
                  <input
                    type="text"
                    className="company-wizard__input"
                    placeholder="Введите ставку (например: 18%)"
                    value={customVat}
                    onChange={handleCustomVatChange}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="company-wizard__footer">
        {step > 1 && <Button onClick={() => setStep((prev) => prev - 1)}>← Назад</Button>}

        {step < 3 ? (
          <Button disabled={step === 1 && !formData.name.trim()} onClick={() => setStep((prev) => prev + 1)}>
            Далее →
          </Button>
        ) : (
          <Button onClick={handleSubmit}>{company ? "Сохранить изменения" : "Завершить и привязать"}</Button>
        )}

        {isEditing && company && <Button onClick={() => setIsEditing(false)}>Отмена</Button>}
      </div>
    </div>
  );
}

export default CompanyProfile;
