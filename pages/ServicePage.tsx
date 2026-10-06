import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppContext } from "../services/AppContext";
import { SavedOfferData, SavedOfferDataSecondForm } from "../type";
import Button from "../components/Button";
import "../components/Commercial.css";

const apiUrl: string = import.meta.env.VITE_API_URL;

type FilterType = "all" | "form0" | "secondForm";
type SortOrder = "desc" | "asc";

function PublicCommercial() {
  const navigate = useNavigate();
  const { setMode, setExportedRows, setExportData } = useAppContext();

  const [form0Data, setForm0Data] = useState<SavedOfferData[]>([]);
  const [secondFormData, setSecondFormData] = useState<SavedOfferDataSecondForm[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Фильтры и сортировка
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Загрузка данных
  const fetchPublicOffers = async () => {
    setLoading(true);
    try {
      const [resForm0, resSecondForm] = await Promise.all([
        axios.put(`${apiUrl}/stroydocs/getpubliccomerc`, {}, { withCredentials: true }),
        axios.put(`${apiUrl}/stroydocs/getpubliccomercsecondform`, {}, { withCredentials: true }),
      ]);

      // Извлекаем массив из свойства .data
      const dataForm0 = resForm0.data?.data || resForm0.data;
      const dataSecondForm = resSecondForm.data?.data || resSecondForm.data;

      setForm0Data(Array.isArray(dataForm0) ? dataForm0 : []);
      setSecondFormData(Array.isArray(dataSecondForm) ? dataSecondForm : []);
    } catch (error) {
      console.error("Ошибка при получении публичных коммерческих предложений:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicOffers();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
      .format(date)
      .replace(",", " в");
  };

  // Сортировка данных по дате
  const sortOffers = <T extends SavedOfferData | SavedOfferDataSecondForm>(list: T[]): T[] => {
    return [...list].sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });
  };

  const sortedForm0 = useMemo(() => sortOffers(form0Data), [form0Data, sortOrder]);
  const sortedSecondForm = useMemo(() => sortOffers(secondFormData), [secondFormData, sortOrder]);

  const handleViewForm0 = (offer: SavedOfferData) => {
    setExportData({
      offerId: offer.id,
      title: offer.title,
      taxRate: offer.taxrate,
      userId: offer.userid,
      rows: offer.rows,
    });
    setMode({
      calculators: false,
      form: true,
      form1: false,
      form2: false,
      referencebook: false,
      management: false,
      fileimport: false,
    });
    setExportedRows(offer.rows);
    navigate("/dashboard");
  };

  const handleViewSecondForm = (offer: SavedOfferDataSecondForm) => {
    setExportData({
      offerId: offer.id,
      title: offer.title,
      taxRate: offer.taxrate,
      userId: offer.userid,
      rows: offer.rows,
    });
    setMode({
      calculators: false,
      form: false,
      form1: true,
      form2: false,
      referencebook: false,
      management: false,
      fileimport: false,
    });
    setExportedRows(offer.rows);
    navigate("/dashboard");
  };

  return (
    <div className="commercial__container">
      {/* Верхняя панель с кнопкой Назад и фильтрами */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "10px",
          marginRight: 35,
        }}
      >
        <Button onClick={() => navigate(-1)}>Назад</Button>

        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <div>
            <label htmlFor="filterType" style={{ marginRight: "8px", fontWeight: "bold" }}>
              Форма:
            </label>
            <select
              id="filterType"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              style={{ padding: "6px 12px", borderRadius: "4px", border: "1px solid #ccc" }}
            >
              <option value="all">Все таблицы</option>
              <option value="form0">Форма 0</option>
              <option value="secondForm">Форма 1</option>
            </select>
          </div>

          <div>
            <label htmlFor="sortOrder" style={{ marginRight: "8px", fontWeight: "bold" }}>
              Дата:
            </label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              style={{ padding: "6px 12px", borderRadius: "4px", border: "1px solid #ccc" }}
            >
              <option value="desc">Сначала новые</option>
              <option value="asc">Сначала старые</option>
            </select>
          </div>
        </div>
      </div>

      <h1>Публичные коммерческие предложения</h1>

      {loading ? (
        <p>Загрузка коммерческих предложений...</p>
      ) : (
        <>
          {/* ТАБЛИЦА ФОРМА 0 */}
          {(filterType === "all" || filterType === "form0") && (
            <div>
              <h2 className="commercial__table-title">Публичные коммерческие предложения (Форма 0)</h2>
              {sortedForm0.length > 0 ? (
                <table className="commercial__table">
                  <thead>
                    <tr>
                      <th>Название</th>
                      <th>Дата сохранения</th>
                      <th>Действие</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedForm0.map((offer) => (
                      <tr key={offer.id}>
                        <td>{offer.title}</td>
                        <td>{formatDate(offer.created_at)}</td>
                        <td className="commercial__actions">
                          <Button onClick={() => handleViewForm0(offer)}>Просмотреть</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Нет доступных публичных предложений Формы 0.</p>
              )}
            </div>
          )}

          {/* ТАБЛИЦА ФОРМА 1 (SECOND FORM) */}
          {(filterType === "all" || filterType === "secondForm") && (
            <div>
              <h2 className="commercial__table-title">Публичные коммерческие предложения (Форма 1)</h2>
              {sortedSecondForm.length > 0 ? (
                <table className="commercial__table">
                  <thead>
                    <tr>
                      <th>Название</th>
                      <th>Дата сохранения</th>
                      <th>Действие</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSecondForm.map((offer) => (
                      <tr key={offer.id}>
                        <td>{offer.title}</td>
                        <td>{formatDate(offer.created_at)}</td>
                        <td className="commercial__actions">
                          <Button onClick={() => handleViewSecondForm(offer)}>Просмотреть</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Нет доступных публичных предложений Формы 1.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PublicCommercial;
