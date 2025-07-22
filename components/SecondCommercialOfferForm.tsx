import React, { useState } from "react";
import "./SecondCommercialOfferForm.css";
import { Mode } from "../type";
import Button from "./Button";

const defaultRow = {
  name: "",
  unit: "",
  quantity: "",
  salary: "",
  material: "",
  machine: "",
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
}

export default function SecondCommercialOfferForm({ setMode }: SecondCommercialOfferFormProps) {
  const [rows, setRows] = useState<RowData[]>([defaultRow]);

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

  const handleSave = () => {
    console.log("Saved data:", rows);
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
  return (
    <div className="commercial-wrapper">
      <div className="commercial__controlUnit">
        <Button onClick={() => setMode?.((prev) => ({ ...prev, form2: false }))}>← Назад</Button>
        <Button onClick={handleSave}>💾 Сохранить</Button>
        <Button onClick={() => window.print()}>🖨️ Печать</Button>
        <Button onClick={handleAddRow}>➕ Добавить строку</Button>
      </div>

      <table className="offer-table">
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
                <td>
                  <input
                    value={row.name}
                    onChange={(e) => handleChange(i, "name", e.target.value)}
                    className="cell-input"
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
                    placeholder="Кол-во"
                    value={row.quantity}
                    onChange={(e) => {
                      console.log("Quantity changed:", e.target.value);
                      handleChange(i, "quantity", e.target.value);
                    }}
                    className="cell-input smaller"
                  />
                </td>
                <td style={{ textAlign: "right", paddingRight: 8, fontWeight: "bold" }}>{unitPrice.toFixed(2)}</td>
                <td>
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
                <td>
                  <button onClick={() => handleCopyRow(i)} className="icon-button icon-button-copy">
                    📄
                  </button>
                </td>
                <td>
                  <button onClick={() => handleDeleteRow(i)} className="icon-button icon-button-del">
                    🗑️
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
