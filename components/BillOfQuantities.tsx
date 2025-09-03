import { useState, useRef } from "react";
import "./BillOfQuantities.css";
import Button from "./Button";
import { Trash2, Copy } from "lucide-react";
import { useAppContext } from "../services/AppContext";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";

interface RowData {
  name: string;
  unit: string;
  quantity: string;
  drawing?: string;
  formula?: string;
}
interface BillOfQuantitiesProps {
  clearMode: () => void;
  showBackButton?: boolean;
}

const BillOfQuantitiesForm = ({ clearMode, showBackButton = true }: BillOfQuantitiesProps) => {
  const [rows, setRows] = useState<RowData[]>([{ name: "", unit: "", quantity: "", drawing: "", formula: "" }]);
  const inputRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const { user, prompt, alert } = useAppContext();

  const addRow = (index?: number) => {
    const newRow: RowData = { name: "", unit: "", quantity: "", drawing: "", formula: "" };
    setRows((prev) => {
      let newRows;
      if (index === undefined || index < 0 || index >= prev.length) {
        newRows = [...prev, newRow];
      } else {
        newRows = [...prev.slice(0, index + 1), newRow, ...prev.slice(index + 1)];
      }
      setTimeout(() => {
        const focusIndex = index !== undefined ? index + 1 : newRows.length - 1;
        inputRefs.current[focusIndex]?.focus();
      }, 0);
      return newRows;
    });
  };

  const duplicateRow = (index: number) => {
    setRows((prev) => {
      const newRows = [...prev];
      newRows.splice(index + 1, 0, { ...prev[index] });
      return newRows;
    });
  };

  const deleteRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof RowData, value: string) => {
    setRows((prev) => {
      const newRows = [...prev];
      newRows[index] = { ...newRows[index], [field]: value };
      return newRows;
    });
  };
  const exportToExcel = async () => {
    if (!rows || rows.length === 0) return;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Ведомость");
    worksheet.mergeCells("A1:F1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "Ведомость объёмов работ";
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    titleCell.font = { size: 16, bold: true };
    worksheet.getRow(1).height = 30;
    worksheet.getRow(1).eachCell((cell) => {
      cell.border = {};
    });
    const headerRow = worksheet.addRow([
      "№ п/п",
      "Наименование работ",
      "Ед. изм.",
      "Кол-во",
      "Ссылки на чертежи",
      "Формула расчёта",
    ]);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    worksheet.getRow(headerRow.number).height = 20;
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
    rows.forEach((row, index) => {
      const dataRow = worksheet.addRow([
        index + 1,
        row.name,
        row.unit,
        row.quantity,
        row.drawing || "",
        row.formula || "",
      ]);
      dataRow.alignment = { horizontal: "center", vertical: "middle" };
      dataRow.getCell(2).alignment = { horizontal: "left", vertical: "middle", wrapText: true };
      const approxLines = Math.ceil((row.name?.length || 0) / 40); // 40 символов = примерно одна строка
      dataRow.height = Math.max(20, approxLines * 15);
      dataRow.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });
    worksheet.columns = [{ width: 10 }, { width: 40 }, { width: 12 }, { width: 10 }, { width: 25 }, { width: 25 }];
    worksheet.addRow([]);
    worksheet.addRow(["___________________ /________________________/", "", "", "", "", "Заказчик"]);
    worksheet.addRow([]);
    worksheet.addRow(["___________________ /________________________/", "", "", "", "", "Подрядчик"]);

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "Ведомость объемов работ.xlsx");
  };

  return (
    <div className="bill-wrapper">
      <div className="commercial__controlUnit">
        {!user && (
          <h3 style={{ color: "red", alignSelf: "center", marginBottom: 20 }}>
            Для возможности сохранения рассчетов нужно авторизироваться!
          </h3>
        )}
        {showBackButton && (
          <Button styled={{ marginBottom: 20 }} onClick={() => clearMode()}>
            ← Назад
          </Button>
        )}
        {user ? (
          <>
            {showBackButton ? (
              <Button onClick={() => console.log()} styled={{ marginBottom: 20 }}>
                Сохранить
              </Button>
            ) : (
              <Button onClick={() => console.log()} styled={{ marginBottom: 20 }}>
                Изменить
              </Button>
            )}
          </>
        ) : null}
        {(user?.subscribe || user?.unlimited) && (
          <Button styled={{ marginBottom: 20 }} onClick={() => window.print()}>
            🖨️ Печать
          </Button>
        )}
        {(user?.subscribe || user?.unlimited) && (
          <Button styled={{ marginBottom: 20 }} onClick={() => exportToExcel()}>
            📊 Выгрузить в Excel
          </Button>
        )}
      </div>
      <h2 className="title">Ведомость объёмов работ</h2>
      <table className="bill-table">
        <thead>
          <tr>
            <th>№ п/п</th>
            <th>Наименование работ</th>
            <th>Ед. изм.</th>
            <th>Кол-во</th>
            <th>Ссылки на чертежи</th>
            <th>Формула расчёта</th>
            <th className="no-print">Действия</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>
                <textarea
                  className="cell-input textarea"
                  value={row.name}
                  onChange={(e) => handleChange(i, "name", e.target.value)}
                  ref={(el) => (inputRefs.current[i] = el)}
                  rows={1}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = target.scrollHeight + "px";
                  }}
                />
              </td>
              <td>
                <input
                  className="cell-input small"
                  value={row.unit}
                  onChange={(e) => handleChange(i, "unit", e.target.value)}
                />
              </td>
              <td>
                <input
                  className="cell-input small"
                  value={row.quantity}
                  onChange={(e) => handleChange(i, "quantity", e.target.value)}
                />
              </td>
              <td>
                <textarea
                  className="cell-input textarea"
                  value={row.drawing}
                  onChange={(e) => handleChange(i, "drawing", e.target.value)}
                  rows={1}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = target.scrollHeight + "px";
                  }}
                />
              </td>
              <td>
                <textarea
                  className="cell-input textarea"
                  value={row.formula}
                  onChange={(e) => handleChange(i, "formula", e.target.value)}
                  rows={1}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = target.scrollHeight + "px";
                  }}
                />
              </td>
              <td className="no-print">
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
            <td colSpan={7} style={{ textAlign: "center", padding: "10px" }}>
              <Button onClick={() => addRow()}>Добавить строку</Button>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="cell-footer">
        <div>
          <div>___________________ /________________________/</div>
          <br></br>
          <div>Заказчик</div>
        </div>
        <div>
          <div>___________________ /________________________/</div>
          <br></br>
          <div>Подрядчик</div>
        </div>
      </div>
    </div>
  );
};

export default BillOfQuantitiesForm;
