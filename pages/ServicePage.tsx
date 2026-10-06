import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppContext } from "../services/AppContext";
import { SavedOfferData, SavedOfferDataSecondForm } from "../type";
import Button from "../components/Button";
import "./ServicePage.css";

const apiUrl: string = import.meta.env.VITE_API_URL;

type SortOrder = "desc" | "asc";

// Структура одного элемента строки из rows
interface OfferRow {
  name?: string;
  unit?: string;
  price?: number | string;
  quantity?: number;
  type?: string;
  [key: string]: any;
}

// Расширенная структура отдельной позиции для рендера
interface FlatPublicOfferRow {
  id: string; // уникальный ключ (id предложения + индекс строки)
  originalOffer: SavedOfferData | SavedOfferDataSecondForm;
  formType: "form0" | "secondForm";
  positionName: string;
  unit: string;
  price: number | string;
  email: string;
  updatedAt: string;
}

function PublicCommercial() {
  const navigate = useNavigate();
  const { setMode, setExportedRows, setExportData } = useAppContext();

  const [offerRows, setOfferRows] = useState<FlatPublicOfferRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Загрузка данных
  const fetchPublicOffers = async () => {
    setLoading(true);
    try {
      const [resForm0, resSecondForm] = await Promise.all([
        axios.put(`${apiUrl}/stroydocs/getpubliccomerc`, {}, { withCredentials: true }),
        axios.put(`${apiUrl}/stroydocs/getpubliccomercsecondform`, {}, { withCredentials: true }),
      ]);

      const dataForm0: SavedOfferData[] = Array.isArray(resForm0.data?.data || resForm0.data)
        ? resForm0.data?.data || resForm0.data
        : [];
      const dataSecondForm: SavedOfferDataSecondForm[] = Array.isArray(resSecondForm.data?.data || resSecondForm.data)
        ? resSecondForm.data?.data || resSecondForm.data
        : [];

      // Функция разворачивания предложений в массив отдельных позиций из rows
      const processOffers = (list: any[], formType: "form0" | "secondForm"): FlatPublicOfferRow[] => {
        return list.flatMap((offer) => {
          const email = offer.user_email || offer.email || "—";
          const updatedAt = offer.updated_at || offer.created_at;
          const rows: OfferRow[] = Array.isArray(offer.rows) ? offer.rows : [];

          // Если rows пустой, создаем запись-заглушку
          if (rows.length === 0) {
            return [
              {
                id: `${formType}-${offer.id}-0`,
                originalOffer: offer,
                formType,
                positionName: offer.title || "—",
                unit: "—",
                price: "—",
                email,
                updatedAt,
              },
            ];
          }

          // Обрабатываем каждую строку из rows
          return rows.map((row, index) => {
            let calculatedPrice: number | string = "—";

            if (formType === "secondForm") {
              const salary = Number(row.salary) || 0;
              const material = Number(row.material) || 0;
              const machine = Number(row.machine) || 0;

              calculatedPrice = salary + material + machine;
            } else {
              calculatedPrice = row.price ?? "—";
            }

            return {
              id: `${formType}-${offer.id}-${index}`,
              originalOffer: offer,
              formType,
              positionName: row.name || offer.title || "—",
              unit: row.unit || "—",
              price: calculatedPrice,
              email,
              updatedAt,
            };
          });
        });
      };

      const flatForm0 = processOffers(dataForm0, "form0");
      const flatSecondForm = processOffers(dataSecondForm, "secondForm");

      setOfferRows([...flatForm0, ...flatSecondForm]);
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
    if (isNaN(date.getTime())) return "—";

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

  // Фильтрация по поисковому запросу и последующая сортировка по дате
  const filteredAndSortedOfferRows = useMemo(() => {
    let result = [...offerRows];

    // 1. Фильтрация
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        const nameMatch = item.positionName.toLowerCase().includes(query);
        const emailMatch = item.email.toLowerCase().includes(query);
        const titleMatch = (item.originalOffer.title || "").toLowerCase().includes(query);

        return nameMatch || emailMatch || titleMatch;
      });
    }

    // 2. Сортировка
    return result.sort((a, b) => {
      const timeA = new Date(a.updatedAt).getTime() || 0;
      const timeB = new Date(b.updatedAt).getTime() || 0;
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });
  }, [offerRows, searchQuery, sortOrder]);

  const handleViewOffer = (item: FlatPublicOfferRow) => {
    const offer = item.originalOffer;

    const formattedRows = (offer.rows || []).map((row: any) => ({
      ...row,
      quantity: String(row.quantity ?? ""),
    }));

    setExportData({
      offerId: offer.id,
      title: offer.title,
      taxRate: offer.taxrate,
      userId: offer.userid,
      rows: formattedRows,
    });

    const isSecondForm = item.formType === "secondForm";

    setMode({
      calculators: false,
      form: !isSecondForm,
      form1: isSecondForm,
      form2: false,
      referencebook: false,
      management: false,
      fileimport: false,
    });

    setExportedRows(formattedRows);
    navigate("/dashboard");
  };

  return (
    <div className="public-com__container">
      {/* Верхняя панель управления */}
      <div className="public-com__header">
        <Button onClick={() => navigate(-1)}>Назад</Button>

        <div className="public-com__filters">
          {/* Поле поиска */}
          <div className="public-com__search-group">
            <input
              type="text"
              className="public-com__input"
              placeholder="Поиск по названию или email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button type="button" className="public-com__clear-btn" onClick={() => setSearchQuery("")}>
                ✕
              </button>
            )}
          </div>

          {/* Сортировка по дате */}
          <div className="public-com__filter-group">
            <label htmlFor="sortOrder" className="public-com__filter-label">
              Дата изменения:
            </label>
            <select
              id="sortOrder"
              className="public-com__select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            >
              <option value="desc">Сначала новые</option>
              <option value="asc">Сначала старые</option>
            </select>
          </div>
        </div>
      </div>

      <h1 className="public-com__page-title">Публичные коммерческие предложения</h1>

      {loading ? (
        <p className="public-com__loading">Загрузка коммерческих предложений...</p>
      ) : filteredAndSortedOfferRows.length > 0 ? (
        <div className="public-com__list">
          {filteredAndSortedOfferRows.map((item) => (
            <div key={item.id} className="public-com__item">
              <div className="public-com__field public-com__field--title">
                <span className="public-com__label">Название позиции:</span>
                <span className="public-com__title">{item.positionName}</span>
              </div>

              <div className="public-com__field public-com__field--unit">
                <span className="public-com__label">Ед. изм.:</span>
                <span className="public-com__unit">{item.unit}</span>
              </div>

              <div className="public-com__field public-com__field--price">
                <span className="public-com__label">Цена:</span>
                <span className="public-com__price">
                  {typeof item.price === "number"
                    ? item.price.toLocaleString("ru-RU", { style: "currency", currency: "RUB" })
                    : item.price}
                </span>
              </div>

              <div className="public-com__field public-com__field--date">
                <span className="public-com__label">Дата изменения:</span>
                <span className="public-com__date">{formatDate(item.updatedAt)}</span>
              </div>

              <div className="public-com__field public-com__field--email">
                <span className="public-com__label">Email владельца:</span>
                <span className="public-com__email">{item.email}</span>
              </div>

              <div className="public-com__actions">
                <Button onClick={() => handleViewOffer(item)}>Просмотреть</Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="public-com__empty">
          {searchQuery ? "По вашему запросу ничего не найдено." : "Нет доступных публичных предложений."}
        </p>
      )}
    </div>
  );
}

export default PublicCommercial;
