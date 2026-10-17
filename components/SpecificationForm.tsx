import { useState, useRef, useEffect } from "react";
import "./CommercialOfferForm.css"; // переиспользуем те же стили (offer-table, cell-input, print-only и т.д.)
import Button from "./Button";
import { Trash2, Copy } from "lucide-react";
import { useAppContext } from "../services/AppContext";
import * as specificationService from "../services/specificationService";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import { useNavigate } from "react-router-dom";

// Строка спецификации (колонки шапки из шаблона «Спецификация_КЖ_шаблон.xlsm»)
export interface SpecRowData {
  name: string; // Наименование и техническая характеристика
  mark: string; // Тип, марка, обозначение документа, опросного листа
  code: string; // Код оборудования, изделия, материала
  manufacturer: string; // Завод-изготовитель
  unit: string; // Ед. измерения
  quantity: number; // Кол.
  mass: string; // Масса 1 ед., кг (в шаблоне бывает " -", поэтому строка)
  note: string; // Примечание
}

interface SpecificationFormProps {
  initialRows?: SpecRowData[] | { rows: SpecRowData[] } | null;
  initialTitle?: string;
  initialOfferId?: number | string;
  tableOwnerId?: string | number;
  onUpdateSuccess?: () => void;
  clearMode?: () => void;
}

const emptyRow = (): SpecRowData => ({
  name: "",
  mark: "",
  code: "",
  manufacturer: "",
  unit: "",
  quantity: 0,
  mass: "",
  note: "",
});

// Принимает и массив строк, и объект вида { rows: [...] } (как приходит с бека)
const normalizeRows = (incoming?: any): SpecRowData[] => {
  const list = Array.isArray(incoming) ? incoming : incoming?.rows;
  if (!Array.isArray(list) || list.length === 0) return [emptyRow()];
  return list.map((r: Partial<SpecRowData>) => ({
    name: r.name || "",
    mark: r.mark || "",
    code: r.code || "",
    manufacturer: r.manufacturer || "",
    unit: r.unit || "",
    quantity: Number(r.quantity) || 0,
    mass: r.mass || "",
    note: r.note || "",
  }));
};

type TextField = Exclude<keyof SpecRowData, "quantity">;

const SpecificationForm = ({
  initialRows,
  initialTitle,
  initialOfferId,
  tableOwnerId,
  onUpdateSuccess,
  clearMode,
}: SpecificationFormProps) => {
  const { user, prompt, alert } = useAppContext();
  const navigate = useNavigate();

  const [rows, setRows] = useState<SpecRowData[]>(() => normalizeRows(initialRows));
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  // Подхват данных, если пропсы пришли с задержкой
  useEffect(() => {
    const list = Array.isArray(initialRows) ? initialRows : initialRows?.rows;
    if (list && list.length > 0) setRows(normalizeRows(initialRows));
  }, [initialRows]);

  const hasAccess = !!(user?.subscribe || user?.unlimited);
  const isOwner = !tableOwnerId || (!!user && String(tableOwnerId) === String(user.id));
  const isExisting = initialOfferId !== undefined && initialOfferId !== null && initialOfferId !== "";

  const sanitizeInput = (value: string) => value.replace(/<\/?[^>]+(>|$)/g, "");

  // ---------- Операции со строками ----------
  const addRow = () => {
    const insertAt =
      selectedRowIndex !== null && selectedRowIndex >= 0 && selectedRowIndex < rows.length
        ? selectedRowIndex + 1
        : rows.length;
    setRows((prev) => [...prev.slice(0, insertAt), emptyRow(), ...prev.slice(insertAt)]);
    setSelectedRowIndex(insertAt);
    setTimeout(() => inputRefs.current[insertAt]?.focus(), 0);
  };

  const duplicateRow = (index: number) => {
    setRows((prev) => [...prev.slice(0, index + 1), { ...prev[index] }, ...prev.slice(index + 1)]);
  };

  const deleteRow = (index: number) => {
    setRows((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : [emptyRow()]));
    setSelectedRowIndex(null);
  };

  const handleTextChange = (index: number, field: TextField, value: string) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: sanitizeInput(value) } : r)));
  };

  const handleQuantityChange = (index: number, value: string) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, quantity: parseFloat(value) || 0 } : r)));
  };

  // Автовысота для textarea
  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  };

  // ---------- Сохранение / изменение ----------
  const handleSave = async () => {
    const title = await prompt({
      title: "Придумайте название сохраняемой спецификации",
      message: "",
      placeholder: "Название",
    });
    if (!title || !user) return;
    const result = await specificationService.saveSpecification({ userId: user.id, title, rows });
    await alert({ title: result.message, message: "" });
  };

  const handleUpdate = async () => {
    const title = await prompt({
      title: "Изменения вступают в силу, название оставляем?",
      message: initialTitle,
      placeholder: "Название",
    });
    if (!title || !user || !isExisting) return;
    const result = await specificationService.updateSpecification({
      offerId: initialOfferId as number | string,
      userId: user.id,
      title,
      rows,
    });
    await alert({ title: result.message, message: "" });
    if (result.ok) onUpdateSuccess?.();
  };

  // ---------- Экспорт в Excel ----------
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Спецификация");

    const thin = { style: "thin" as const };
    const border = { top: thin, left: thin, bottom: thin, right: thin };

    ws.columns = [
      { width: 7 }, // Поз.
      { width: 50 }, // Наименование
      { width: 28 }, // Тип, марка
      { width: 22 }, // Код
      { width: 22 }, // Завод-изготовитель
      { width: 12 }, // Ед. изм.
      { width: 10 }, // Кол.
      { width: 12 }, // Масса
      { width: 30 }, // Примечание
    ];

    ws.mergeCells("A1", "I1");
    const title = ws.getCell("A1");
    title.value = "СПЕЦИФИКАЦИЯ ОБОРУДОВАНИЯ, ИЗДЕЛИЙ И МАТЕРИАЛОВ";
    title.font = { bold: true, size: 14 };
    title.alignment = { horizontal: "center", vertical: "middle" };
    ws.addRow([]);

    const header = ws.addRow([
      "Поз.",
      "Наименование и техническая характеристика",
      "Тип, марка, обозначение документа, опросного листа",
      "Код оборудования, изделия, материала",
      "Завод-изготовитель",
      "Ед. измерения",
      "Кол.",
      "Масса 1 ед., кг",
      "Примечание",
    ]);
    header.font = { bold: true };
    header.height = 60;
    header.eachCell((cell) => {
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = border;
    });

    rows.forEach((r, i) => {
      const row = ws.addRow([i + 1, r.name, r.mark, r.code, r.manufacturer, r.unit, r.quantity, r.mass, r.note]);
      const longest = Math.max(
        Math.ceil(r.name.length / 50),
        Math.ceil(r.mark.length / 28),
        Math.ceil(r.code.length / 22),
        Math.ceil(r.manufacturer.length / 22),
        Math.ceil(r.note.length / 30),
        1,
      );
      row.height = longest * 17;
      row.eachCell((cell, col) => {
        cell.border = border;
        cell.alignment = {
          wrapText: true,
          vertical: "middle",
          horizontal: col === 2 || col === 3 || col === 9 ? "left" : "center",
        };
      });
    });

    ws.addRow([]);
    ws.addRow([]);
    ws.addRow(["Заказчик", "", "___________________ /________________________/"]);
    ws.addRow([]);
    ws.addRow(["Подрядчик", "", "___________________ /________________________/"]);

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "Спецификация.xlsx");
  };

  // ---------- Экспорт в ведомость выполненных работ ----------
  const exportInBillOfQuantities = () => {
    // В спецификации нет цен, поэтому цена = 0 — заполняется уже в ведомости.
    // Тип по умолчанию «материалы» (при необходимости поменяйте на «оборудование»).
    const convertedRows = rows
      .filter((r) => r.name.trim() !== "")
      .map((r) => ({
        name: [r.name.trim(), r.mark.trim()].filter(Boolean).join(", "),
        unit: r.unit,
        quantity: r.quantity,
        type: "материалы",
        price: 0,
      }));

    navigate("/forms/bill-of-quantities", {
      state: {
        rows: convertedRows,
        taxRate: 20,
      },
    });
  };

  return (
    <div className="commercial-wrapper">
      <div className="commercial__controlUnit">
        <Button styled={{ marginBottom: 20 }} onClick={() => clearMode?.()}>
          ← Назад
        </Button>

        {!user && (
          <h3 style={{ color: "red", alignSelf: "center", marginBottom: 20 }}>
            Для возможности сохранения расчётов нужно авторизироваться!
          </h3>
        )}
        {hasAccess && (
          <Button styled={{ marginBottom: 20 }} onClick={exportInBillOfQuantities}>
            🔀 Экспорт в ведомость
          </Button>
        )}
        {user &&
          (isExisting ? (
            <Button onClick={handleUpdate} disabled={!isOwner} styled={{ marginBottom: 20 }}>
              Изменить
            </Button>
          ) : (
            <Button onClick={handleSave} styled={{ marginBottom: 20 }}>
              Сохранить
            </Button>
          ))}
        {hasAccess && (
          <Button styled={{ marginBottom: 20 }} onClick={() => window.print()}>
            🖨️ Печать
          </Button>
        )}
        {hasAccess && (
          <Button styled={{ marginBottom: 20 }} onClick={exportToExcel}>
            📊 Выгрузить в Excel
          </Button>
        )}
      </div>

      <h2 className="title">СПЕЦИФИКАЦИЯ ОБОРУДОВАНИЯ, ИЗДЕЛИЙ И МАТЕРИАЛОВ</h2>

      <table className="offer-table">
        <thead>
          <tr>
            <th>Поз.</th>
            <th>Наименование и техническая характеристика</th>
            <th>
              Тип, марка, обозначение
              <br />
              документа, опросного листа
            </th>
            <th>Код оборудования, изделия, материала</th>
            <th>Завод-изготовитель</th>
            <th>Ед. измерения</th>
            <th>Кол.</th>
            <th>
              Масса 1 ед.,
              <br />
              кг
            </th>
            <th>Примечание</th>
            <th className="test-col"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} onFocus={() => setSelectedRowIndex(i)}>
              <td>{i + 1}</td>
              <td>
                <textarea
                  className="cell-input textarea"
                  rows={1}
                  value={row.name}
                  onChange={(e) => handleTextChange(i, "name", e.target.value)}
                  ref={(el) => {
                    autoResize(el);
                    inputRefs.current[i] = el;
                  }}
                />
              </td>
              <td>
                <textarea
                  className="cell-input textarea"
                  rows={1}
                  value={row.mark}
                  onChange={(e) => handleTextChange(i, "mark", e.target.value)}
                  ref={autoResize}
                />
              </td>
              <td>
                <textarea
                  className="cell-input textarea"
                  rows={1}
                  value={row.code}
                  onChange={(e) => handleTextChange(i, "code", e.target.value)}
                  ref={autoResize}
                />
              </td>
              <td>
                <textarea
                  className="cell-input textarea"
                  rows={1}
                  value={row.manufacturer}
                  onChange={(e) => handleTextChange(i, "manufacturer", e.target.value)}
                  ref={autoResize}
                />
              </td>
              <td>
                <input
                  className="cell-input small"
                  value={row.unit}
                  onChange={(e) => handleTextChange(i, "unit", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  step="0.000001"
                  min="0"
                  className="cell-input smallest no-spinner"
                  value={row.quantity}
                  onChange={(e) => handleQuantityChange(i, e.target.value)}
                />
              </td>
              <td>
                <input
                  className="cell-input smallest"
                  value={row.mass}
                  onChange={(e) => handleTextChange(i, "mass", e.target.value)}
                />
              </td>
              <td>
                <textarea
                  className="cell-input textarea"
                  rows={1}
                  value={row.note}
                  onChange={(e) => handleTextChange(i, "note", e.target.value)}
                  ref={autoResize}
                />
              </td>
              <td>
                <div className="icon-button-box">
                  <button className="icon-button icon-button-copy" onClick={() => duplicateRow(i)}>
                    <Copy size={18} />
                  </button>
                  <button className="icon-button icon-button-del" onClick={() => deleteRow(i)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={10} style={{ padding: "10px", textAlign: "center" }}>
              <Button onClick={addRow}>Добавить строку</Button>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="cell-footer">
        <div>
          Заказчик <br /> ___________________ /________________________/
        </div>
        <div>
          Подрядчик <br /> ___________________ /________________________/
        </div>
      </div>
    </div>
  );
};

export default SpecificationForm;
