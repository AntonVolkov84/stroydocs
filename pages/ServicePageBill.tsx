import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppContext } from "../services/AppContext";
import Button from "../components/Button";
import "./ServicePageBill.css";

const apiUrl: string = import.meta.env.VITE_API_URL;

type SortOrder = "desc" | "asc";

// Структура сохраненной ведомости объемов работ
export interface SavedBillOfQuantitiesData {
  id: number;
  userid: number;
  title: string;
  rows: any[];
  ispublic?: boolean;
  isPublic?: boolean;
  user_email?: string;
  email?: string;
  user_name?: string;
  user_surname?: string;
  updated_at?: string;
  created_at?: string;
}

// Элемент строки из массива rows ведомости
interface BillRow {
  name?: string;
  unit?: string;
  quantity?: number | string;
  price?: number | string;
  [key: string]: any;
}

// Расширенная структура отдельной позиции для табличного рендера
interface FlatPublicBillRow {
  id: string; // уникальный ключ (id ведомости + индекс строки)
  originalBill: SavedBillOfQuantitiesData;
  positionName: string;
  unit: string;
  quantity: number | string;
  price: number | string;
  email: string;
  updatedAt: string;
}

const ITEMS_PER_PAGE = 20;

function ServicePageBill() {
  const navigate = useNavigate();
  const { setMode, setExportedRows, setExportData } = useAppContext();

  const [billRows, setBillRows] = useState<FlatPublicBillRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Сброс страницы при поиске или смене сортировки
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortOrder]);

  // Загрузка публичных ведомостей
  const fetchPublicBills = async () => {
    setLoading(true);
    try {
      const res = await axios.put(`${apiUrl}/stroydocs/getpublicbillofquantities`, {}, { withCredentials: true });

      const dataBills: SavedBillOfQuantitiesData[] = Array.isArray(res.data?.data || res.data)
        ? res.data?.data || res.data
        : [];

      // Разворачиваем каждую ведомость в массив отдельных строк
      const flatBills = dataBills.flatMap((bill) => {
        const email = bill.user_email || bill.email || "—";
        const updatedAt = bill.updated_at || bill.created_at || "";
        const rows: BillRow[] = Array.isArray(bill.rows) ? bill.rows : [];

        // Исключаем строки без наименования
        const validRows = rows.filter((row) => row.name && String(row.name).trim() !== "");

        if (validRows.length === 0) {
          return [];
        }

        return validRows.map((row, index) => {
          return {
            id: `bill-${bill.id}-${index}`,
            originalBill: bill,
            positionName: row.name!.trim(),
            unit: row.unit || "—",
            quantity: row.quantity ?? "—",
            price: row.price ?? "—",
            email,
            updatedAt,
          };
        });
      });

      setBillRows(flatBills);
    } catch (error) {
      console.error("Ошибка при получении публичных ведомостей объёмов работ:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicBills();
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

  // 1. Фильтрация и сортировка
  const filteredAndSortedBillRows = useMemo(() => {
    let result = [...billRows];

    // Поиск
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        const nameMatch = item.positionName.toLowerCase().includes(query);
        const emailMatch = item.email.toLowerCase().includes(query);
        const titleMatch = (item.originalBill.title || "").toLowerCase().includes(query);

        return nameMatch || emailMatch || titleMatch;
      });
    }

    // Сортировка по дате
    return result.sort((a, b) => {
      const timeA = new Date(a.updatedAt).getTime() || 0;
      const timeB = new Date(b.updatedAt).getTime() || 0;
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });
  }, [billRows, searchQuery, sortOrder]);

  // 2. Пагинация
  const paginatedBillRows = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedBillRows.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedBillRows, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedBillRows.length / ITEMS_PER_PAGE);

  // Переход к просмотру/редактированию ведомости
  const handleViewBill = (item: FlatPublicBillRow) => {
    const bill = item.originalBill;

    const formattedRows = (bill.rows || []).map((row: any) => ({
      ...row,
      quantity: String(row.quantity ?? ""),
    }));

    setExportData({
      id: bill.id,
      title: bill.title,
      userid: bill.userid,
      rows: bill.rows,
      updated_at: bill.updated_at as string,
    });

    // Режим работы для ведомости объемов (form2 / billbook)
    setMode({
      calculators: false,
      form: false,
      form1: false,
      form2: true,
      referencebook: false,
      management: false,
      fileimport: false,
    });

    setExportedRows(formattedRows);
    navigate("/dashboard");
  };

  return (
    <div className="public-bill__container">
      {/* Верхняя панель управления */}
      <div className="public-bill__header">
        <Button onClick={() => navigate(-1)}>Назад</Button>

        <div className="public-bill__filters">
          {/* Поле поиска */}
          <div className="public-bill__search-group">
            <input
              type="text"
              className="public-bill__input"
              placeholder="Поиск по названию или email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button type="button" className="public-bill__clear-btn" onClick={() => setSearchQuery("")}>
                ✕
              </button>
            )}
          </div>

          {/* Сортировка по дате */}
          <div className="public-bill__filter-group">
            <label htmlFor="sortOrderBill" className="public-bill__filter-label">
              Дата изменения:
            </label>
            <select
              id="sortOrderBill"
              className="public-bill__select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            >
              <option value="desc">Сначала новые</option>
              <option value="asc">Сначала старые</option>
            </select>
          </div>
        </div>
      </div>

      <h1 className="public-bill__page-title">Публичные ведомости объёмов работ</h1>

      {loading ? (
        <p className="public-bill__loading">Загрузка ведомостей...</p>
      ) : filteredAndSortedBillRows.length > 0 ? (
        <div className="public-bill__list">
          {paginatedBillRows.map((item) => (
            <div key={item.id} className="public-bill__item">
              <div className="public-bill__field public-bill__field--title">
                <span className="public-bill__label">Название позиции:</span>
                <span className="public-bill__title">{item.positionName}</span>
              </div>

              <div className="public-bill__field public-bill__field--unit">
                <span className="public-bill__label">Ед. изм.:</span>
                <span className="public-bill__unit">{item.unit}</span>
              </div>

              <div className="public-bill__field public-bill__field--quantity">
                <span className="public-bill__label">Кол-во:</span>
                <span className="public-bill__quantity">{item.quantity}</span>
              </div>
              <div className="public-bill__field public-bill__field--date">
                <span className="public-bill__label">Дата изменения:</span>
                <span className="public-bill__date">{formatDate(item.updatedAt)}</span>
              </div>

              <div className="public-bill__field public-bill__field--email">
                <span className="public-bill__label">Email владельца:</span>
                <span className="public-bill__email">{item.email}</span>
              </div>

              <div className="public-bill__actions">
                <Button onClick={() => handleViewBill(item)}>Просмотреть</Button>
              </div>
            </div>
          ))}

          {/* Элементы пагинации */}
          {totalPages > 1 && (
            <div className="public-bill__pagination">
              <Button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}>
                ← Назад
              </Button>

              <span className="public-bill__page-info">
                Страница <strong>{currentPage}</strong> из <strong>{totalPages}</strong>
              </span>

              <Button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              >
                Вперед →
              </Button>
            </div>
          )}
        </div>
      ) : (
        <p className="public-bill__empty">
          {searchQuery ? "По вашему запросу ничего не найдено." : "Нет доступных публичных ведомостей."}
        </p>
      )}
    </div>
  );
}

export default ServicePageBill;
