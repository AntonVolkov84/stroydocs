import React, { useState, Dispatch, SetStateAction, useRef } from "react";
import "./SecondCommercialOfferForm.css";
import { Mode, SavedOfferDataSecondForm } from "../type";
import Button from "./Button";
import { useAppContext } from "../services/AppContext";
import * as commercialOfferService from "../services/commercialOfferService";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const defaultRow = {
  name: "",
  unit: "",
  quantity: "",
  salary: "0",
  material: "0",
  machine: "0",
};
type RowData = {
  name: string;
  unit: string;
  quantity: string;
  salary: string;
  material: string;
  machine: string;
};

interface SecondCommercialOfferFormProps {
  setMode?: React.Dispatch<React.SetStateAction<Mode>>;
  initialRows?: RowData[];
  initialTaxRate?: string | number;
  initialTitle?: string;
  key?: string | number;
  showBackButton?: boolean;
  initialOfferId?: number | string;
  onUpdateSuccess?: () => void;
  setSelectedOffer?: Dispatch<SetStateAction<SavedOfferDataSecondForm | null>>;
}

export default function SecondCommercialOfferForm({
  setMode,
  initialRows,
  initialTaxRate,
  key,
  showBackButton = true,
  initialTitle,
  initialOfferId,
  onUpdateSuccess,
  setSelectedOffer,
}: SecondCommercialOfferFormProps) {
  const [rows, setRows] = useState<RowData[]>(initialRows || [{ ...defaultRow }]);
  const [taxPercent, setTaxPercent] = useState<string | number>(initialTaxRate || "20");
  const { user, prompt, alert } = useAppContext();
  const inputRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

  const handleChange = (index: number, field: keyof RowData, value: string) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const handleAddRow = (index: number | null) => {
    const newRow: RowData = { name: "", unit: "", quantity: "0", salary: "0", material: "0", machine: "0" };
    setRows((prev) => {
      let newRows;
      if (index === undefined || index === null || index < 0 || index >= prev.length) {
        newRows = [...prev, newRow];
        setTimeout(() => {
          inputRefs.current[newRows.length - 1]?.focus();
        }, 0);
      } else {
        newRows = [...prev.slice(0, index + 1), newRow, ...prev.slice(index + 1)];
        setTimeout(() => {
          inputRefs.current[index + 1]?.focus();
        }, 0);
      }
      return newRows;
    });
  };

  const handleDeleteRow = (index: number) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
  };

  const handleCopyRow = (index: number) => {
    const newRows = [...rows, { ...rows[index] }];
    setRows(newRows);
  };

  const handleSave = async () => {
    const promptResult = await prompt({
      title: "Придумайте название сохраняемой форме",
      message: "",
      placeholder: "Название",
    });
    if (promptResult && user) {
      const payload = {
        title: promptResult,
        userId: user.id,
        taxRate: taxPercent,
        rows: [...rows],
      };
      const res = await commercialOfferService.saveCommercialOfferSecondForm(payload);
      if (res.message)
        await alert({
          title: res.message,
          message: "",
        });
    }
  };

  const computeUnitPrice = (row: RowData) => {
    const s = parseFloat(row.salary) || 0;
    const m = parseFloat(row.material) || 0;
    const mach = parseFloat(row.machine) || 0;
    return s + m + mach;
  };

  const computeTotal = (row: RowData) => {
    const q = parseFloat(row.quantity) || 0;
    const unit = computeUnitPrice(row);
    return q * unit;
  };
  const computeTotalSum = (row: RowData) => {
    const salary = parseFloat(row.salary) || 0;
    const material = parseFloat(row.material) || 0;
    const machine = parseFloat(row.machine) || 0;
    const quantity = parseFloat(row.quantity) || 0;
    return quantity * (salary + material + machine);
  };
  const totalSalaryCost = rows.reduce((acc, row) => acc + parseFloat(row.salary) * (parseFloat(row.quantity) || 0), 0);
  const totalMaterialCost = rows.reduce(
    (acc, row) => acc + parseFloat(row.material) * (parseFloat(row.quantity) || 0),
    0
  );
  const totalMachineCost = rows.reduce(
    (acc, row) => acc + parseFloat(row.machine) * (parseFloat(row.quantity) || 0),
    0
  );
  const totalCost = totalSalaryCost + totalMaterialCost + totalMachineCost;
  const taxValue = parseFloat(typeof taxPercent === "number" ? taxPercent.toString() : taxPercent) || 0;
  const taxAmount = totalCost * (taxValue / 100);
  const totalByTable = totalCost + taxAmount;
  const handleUpdate = async () => {
    const promptResult = await prompt({
      title: "Измените название",
      message: "",
      placeholder: initialTitle,
      confirmText: "Изменить",
    });
    if (promptResult) {
      if (!initialOfferId || !user) return;
      const payload = {
        offerId: initialOfferId,
        rows: rows,
        taxRate: taxPercent,
        userId: user?.id,
        title: promptResult,
      };
      await commercialOfferService.updateCommercialOfferSecondForm(payload);
      if (onUpdateSuccess) onUpdateSuccess();
      if (setSelectedOffer) setSelectedOffer(null);
    }
  };
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Коммерческое предложение");
    worksheet.mergeCells("A1", "M1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ";
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.addRow([]);
    worksheet.mergeCells("A2", "M2");
    const lineCell = worksheet.getCell("A2");
    lineCell.value = "_________________________________________________________________________________";
    lineCell.alignment = { horizontal: "center" };
    worksheet.mergeCells("A3", "M3");
    const placeholderCell = worksheet.getCell("A3");
    placeholderCell.value = "(наименование работ и затрат, наименование объекта)";
    placeholderCell.alignment = { horizontal: "center" };
    placeholderCell.font = { italic: true };
    worksheet.addRow([]);
    const headerRow = worksheet.addRow([
      "№ п/п",
      "Наименование работ",
      "Ед. изм.",
      "Кол-во",
      "Цена за единицу, руб. без НДС",
      "Заработная плата",
      "Материал",
      "Эксплуатация машин",
      "ВСЕГО",
      "Осн. зарплата",
      "Материалы",
      "Экспл. машин",
    ]);
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
    rows.forEach((row, index) => {
      const unitPrice = computeUnitPrice(row);
      const totalSum = computeTotalSum(row);
      const rowValues = [
        index + 1,
        row.name,
        row.unit,
        row.quantity,
        unitPrice.toFixed(2),
        row.salary,
        row.material,
        row.machine,
        totalSum.toFixed(2),
        (parseFloat(row.salary) * (parseFloat(row.quantity) || 0)).toFixed(2),
        (parseFloat(row.material) * (parseFloat(row.quantity) || 0)).toFixed(2),
        (parseFloat(row.machine) * (parseFloat(row.quantity) || 0)).toFixed(2),
      ];
      const newRow = worksheet.addRow(rowValues);
      newRow.getCell(2).alignment = { wrapText: true, horizontal: "left", vertical: "middle" };
      const approxLines = Math.ceil(row.name.length / 40);
      newRow.height = approxLines * 17;
      newRow.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        if (typeof cell.value === "number" || !isNaN(parseFloat(cell.value as string))) {
          cell.alignment = { horizontal: "right" };
        }
        if (colNumber === 2) {
          cell.alignment = { wrapText: true, horizontal: "left", vertical: "middle" };
        } else if (typeof cell.value === "number" || !isNaN(parseFloat(cell.value as string))) {
          cell.alignment = { horizontal: "right", vertical: "middle", wrapText: true };
        } else {
          cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        }
      });
    });
    worksheet.addRow([]);
    const summaryRows = [
      [
        "",
        "ИТОГ без НДС",
        "руб.",
        "",
        "",
        "",
        "",
        "",
        totalCost.toFixed(2),
        totalSalaryCost.toFixed(2),
        totalMaterialCost.toFixed(2),
        totalMachineCost.toFixed(2),
      ],
      ["", "Налоги, %", taxPercent.toString(), "", "", "", "", "", taxAmount.toFixed(2), "", "", ""],
      ["", "Всего с НДС", "руб.", "", "", "", "", "", totalByTable.toFixed(2), "", "", ""],
    ];

    summaryRows.forEach((data) => {
      const row = worksheet.addRow(data);
      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };

        if (colNumber === 9) {
          cell.alignment = { horizontal: "right" };
        }
        if (colNumber > 9) {
          cell.alignment = { horizontal: "right" };
        }
      });
    });
    worksheet.addRow([]);
    const customerRow = worksheet.addRow(["", "Заказчик", "", "___________________ /_____________________/"]);
    worksheet.addRow([]);
    const contractorRow = worksheet.addRow(["", "Подрядчик", "", "___________________ /_____________________/"]);
    worksheet.columns = [
      { width: 6 },
      { width: 40 },
      { width: 10 },
      { width: 10 },
      { width: 20 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 18 },
      { width: 18 },
      { width: 18 },
      { width: 18 },
    ];
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "Коммерческое_предложение форма1.xlsx");
  };

  return (
    <div className="commercial-wrapper">
      {!user && (
        <h3 style={{ color: "red", alignSelf: "center", marginBottom: 20 }}>
          Для возможности сохранения рассчетов нужно авторизироваться!
        </h3>
      )}
      {user ? (
        <div className="commercial__controlUnit">
          {showBackButton && <Button onClick={() => setMode?.((prev) => ({ ...prev, form1: false }))}>← Назад</Button>}
          {showBackButton ? (
            <Button onClick={handleSave}>💾 Сохранить</Button>
          ) : (
            <Button onClick={handleUpdate}>💾 Изменить</Button>
          )}
          {(user.subscribe || user.unlimited) && <Button onClick={() => window.print()}>🖨️ Печать</Button>}
          {(user.subscribe || user.unlimited) && <Button onClick={() => exportToExcel()}>📊 Выгрузить в Excel</Button>}
        </div>
      ) : (
        <div className="commercial__controlUnit">
          {showBackButton && <Button onClick={() => setMode?.((prev) => ({ ...prev, form1: false }))}>← Назад</Button>}
        </div>
      )}
      <h2 className="title">КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ</h2>
      <h4 className="title-line print-only">___________________________________________________</h4>
      <h6 className="title-placeholder print-only">(наименование работ и затрат, наименование объекта)</h6>
      <table className="offer-table" style={{ tableLayout: "fixed", width: "100%" }}>
        <colgroup>
          <col style={{ width: "40px" }} />
          <col style={{ width: "250px" }} />
          <col style={{ width: "70px" }} />
          <col style={{ width: "70px" }} />
          <col style={{ width: "120px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "120px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "40px" }} />
          <col style={{ width: "40px" }} />
        </colgroup>
        <thead>
          <tr>
            <th rowSpan={3}>№ п/п</th>
            <th rowSpan={3}>Наименование работ</th>
            <th rowSpan={3}>Ед. изм.</th>
            <th rowSpan={3}>Кол-во</th>
            <th rowSpan={3}>Цена за единицу, руб. без НДС</th>
            <th colSpan={3}>Цена за единицу, руб. без НДС</th>
            <th colSpan={4}>Стоимость, руб. без НДС</th>
            <th rowSpan={3} colSpan={2}>
              Действия
            </th>
          </tr>
          <tr>
            <th rowSpan={2}>Заработная плата</th>
            <th rowSpan={2}>Материал</th>
            <th rowSpan={2}>Эксплуатация машин</th>
            <th rowSpan={2}>ВСЕГО</th>
            <th rowSpan={2}>Осн. зарплата</th>
            <th rowSpan={2}>Материалы</th>
            <th rowSpan={2}>Экспл. машин</th>
          </tr>
          <tr />
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const unitPrice = computeUnitPrice(row);
            const total = computeTotal(row);

            return (
              <tr key={i} onFocus={() => setSelectedRowIndex(i)}>
                <td>{i + 1}</td>
                <td style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                  <textarea
                    style={{ resize: "none", width: "100%", whiteSpace: "normal", wordBreak: "break-word" }}
                    value={row.name}
                    onChange={(e) => handleChange(i, "name", e.target.value)}
                    className="cell-input"
                    rows={1}
                    ref={(el) => {
                      if (el) {
                        el.style.height = "auto";
                        el.style.height = el.scrollHeight + "px";
                        inputRefs.current[i] = el;
                      }
                    }}
                  />
                </td>
                <td>
                  <input
                    value={row.unit}
                    onChange={(e) => handleChange(i, "unit", e.target.value)}
                    className="cell-input smaller"
                  />
                </td>
                <td>
                  <input
                    value={row.quantity}
                    onChange={(e) => {
                      handleChange(i, "quantity", e.target.value);
                    }}
                    className="cell-input smaller"
                  />
                </td>
                <td style={{ textAlign: "right", paddingRight: 8, fontWeight: "bold" }}>{unitPrice.toFixed(2)}</td>
                <td className="cell-blockinput">
                  <input
                    value={row.salary}
                    onChange={(e) => handleChange(i, "salary", e.target.value)}
                    className="cell-input smaller"
                  />
                </td>
                <td>
                  <input
                    value={row.material}
                    onChange={(e) => handleChange(i, "material", e.target.value)}
                    className="cell-input smaller"
                  />
                </td>
                <td>
                  <input
                    value={row.machine}
                    onChange={(e) => handleChange(i, "machine", e.target.value)}
                    className="cell-input smaller"
                  />
                </td>
                <td>{computeTotalSum(row).toFixed(2)}</td>
                <td>{(parseFloat(row.salary) * parseFloat(row.quantity) || 0).toFixed(2)}</td>
                <td>{(parseFloat(row.material) * parseFloat(row.quantity) || 0).toFixed(2)}</td>
                <td>{(parseFloat(row.machine) * parseFloat(row.quantity) || 0).toFixed(2)}</td>
                <td className="hide-in-print">
                  <button onClick={() => handleCopyRow(i)} className="icon-button icon-button-copy">
                    📄
                  </button>
                </td>
                <td className="hide-in-print">
                  <button onClick={() => handleDeleteRow(i)} className="icon-button icon-button-del">
                    🗑️
                  </button>
                </td>
              </tr>
            );
          })}
          <tr>
            <td colSpan={14} style={{ textAlign: "center" }}>
              <Button onClick={() => handleAddRow(selectedRowIndex)}>➕ Добавить строку</Button>
            </td>
          </tr>
          <>
            <tr className="total-row">
              <td></td>
              <td>ИТОГ без НДС</td>
              <td>руб.</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td>{totalCost.toFixed(2)}</td>
              <td>{totalSalaryCost.toFixed(2)}</td>
              <td>{totalMaterialCost.toFixed(2)}</td>
              <td>{totalMachineCost.toFixed(2)}</td>
              <td className="hide-in-print"></td>
              <td className="hide-in-print"></td>
            </tr>
          </>
          <>
            <tr className="tax-row">
              <td></td>
              <td>Налоги, %</td>
              <td>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(e.target.value)}
                  className="cell-input smaller"
                />
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td>{taxAmount.toFixed(2)}</td>
              <td></td>
              <td></td>
              <td></td>
              <td className="hide-in-print"></td>
              <td className="hide-in-print"></td>
            </tr>
          </>
          <>
            <tr className="tax-row">
              <td></td>
              <td>Всего с НДС</td>
              <td>руб.</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td>{totalByTable.toFixed(2)}</td>
              <td></td>
              <td></td>
              <td></td>
              <td className="hide-in-print"></td>
              <td className="hide-in-print"></td>
            </tr>
          </>
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
}
