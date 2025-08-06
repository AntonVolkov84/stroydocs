import React, { useState, Dispatch, SetStateAction } from "react";
import "./SecondCommercialOfferForm.css";
import { Mode, SavedOfferDataSecondForm } from "../type";
import Button from "./Button";
import { useAppContext } from "../services/AppContext";
import * as commercialOfferService from "../services/commercialOfferService";

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
  initialTaxRate?: string;
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
  const [rows, setRows] = useState<RowData[]>(initialRows || [defaultRow]);
  const [taxPercent, setTaxPercent] = useState(initialTaxRate || "20");
  const { user, prompt, alert } = useAppContext();

  const handleChange = (index: number, field: keyof RowData, value: string) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const handleAddRow = () => {
    setRows([...rows, defaultRow]);
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
  const taxValue = parseFloat(taxPercent) || 0;
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

  return (
    <div className="commercial-wrapper">
      {!user && (
        <h3 style={{ color: "red", alignSelf: "center", marginBottom: 20 }}>
          Для возможности сохранения рассчетов нужно авторизироваться!
        </h3>
      )}
      {user && (
        <div className="commercial__controlUnit">
          {showBackButton && <Button onClick={() => setMode?.((prev) => ({ ...prev, form1: false }))}>← Назад</Button>}
          {showBackButton ? (
            <Button onClick={handleSave}>💾 Сохранить</Button>
          ) : (
            <Button onClick={handleUpdate}>💾 Изменить</Button>
          )}
          <Button onClick={() => window.print()}>🖨️ Печать</Button>
          <Button onClick={handleAddRow}>➕ Добавить строку</Button>
        </div>
      )}
      <h2 className="title">КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ</h2>
      <h4 className="title-line">___________________________________________________</h4>
      <h6 className="title-placeholder">(наименование работ и затрат, наименование объекта)</h6>
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
              <tr key={i}>
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
