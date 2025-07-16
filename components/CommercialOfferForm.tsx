import React, { useState, Dispatch, SetStateAction } from "react";
import "./CommercialOfferForm.css";
import Button from "./Button";
import { Mode } from "../type";

interface RowData {
  name: string;
  unit: string;
  quantity: number;
  price: number;
}
interface CommercialOfferFormProps {
  setMode: Dispatch<SetStateAction<Mode>>;
}

const initialRows: RowData[] = Array.from({ length: 11 }, () => ({
  name: "",
  unit: "",
  quantity: 0,
  price: 0,
}));

const CommercialOfferForm = ({ setMode }: CommercialOfferFormProps) => {
  const [rows, setRows] = useState<RowData[]>(initialRows);

  const computedTotals = rows.map((r) => +(r.quantity * r.price).toFixed(2));
  const total = computedTotals.reduce((sum, val) => sum + val, 0);

  const summary = {
    salary: +(total * 0.35).toFixed(2),
    materials: +(total * 0.6).toFixed(2),
    machines: +(total * 0.023).toFixed(2),
    tax: +((total * 0.35 + total * 0.6 + total * 0.023) * 0.2).toFixed(2),
  };

  const withVAT = +(total + summary.tax).toFixed(2);

  const handleChange = (index: number, field: keyof RowData, value: string) => {
    const newRows = [...rows];
    const parsed = field === "name" || field === "unit" ? value : parseFloat(value) || 0;
    newRows[index] = { ...newRows[index], [field]: parsed };
    setRows(newRows);
  };

  return (
    <div className="commercial-wrapper">
      <Button styled={{ marginBottom: 50 }} onClick={() => setMode((prev) => ({ form: false, calculators: false }))}>
        ← Назад
      </Button>
      <div className="header-info">
        <div className="left">Приложение №2</div>
        <div className="right">
          к Договору подряда на выполнение работ № <input className="inline-input" /> от{" "}
          <input className="inline-input short" /> 202___ г.
        </div>
      </div>
      <h2 className="title">КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ</h2>
      <table className="offer-table">
        <thead>
          <tr>
            <th>№ п/п</th>
            <th>Наименование работ и затрат</th>
            <th>Ед. изм.</th>
            <th>Количество</th>
            <th>Цена, руб.</th>
            <th>Стоимость, руб</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>
                <input
                  className="cell-input"
                  value={row.name}
                  onChange={(e) => handleChange(i, "name", e.target.value)}
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
                  type="number"
                  className="cell-input smaller"
                  value={row.quantity}
                  onChange={(e) => handleChange(i, "quantity", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  className="cell-input smaller"
                  value={row.price}
                  onChange={(e) => handleChange(i, "price", e.target.value)}
                />
              </td>
              <td>
                <input type="text" readOnly className="cell-input" value={computedTotals[i].toFixed(2)} />
              </td>
            </tr>
          ))}

          <tr>
            <td colSpan={5}>ИТОГ без НДС</td>
            <td>
              <input className="cell-input" readOnly value={total.toFixed(2)} />
            </td>
          </tr>
          <tr>
            <td colSpan={5}>- Заработная плата</td>
            <td>
              <input className="cell-input" readOnly value={summary.salary.toFixed(2)} />
            </td>
          </tr>
          <tr>
            <td colSpan={5}>- Материал</td>
            <td>
              <input className="cell-input" readOnly value={summary.materials.toFixed(2)} />
            </td>
          </tr>
          <tr>
            <td colSpan={5}>- Эксплуатация машин</td>
            <td>
              <input className="cell-input" readOnly value={summary.machines.toFixed(2)} />
            </td>
          </tr>
          <tr>
            <td colSpan={5}>- Налоги 20%</td>
            <td>
              <input className="cell-input" readOnly value={summary.tax.toFixed(2)} />
            </td>
          </tr>
          <tr>
            <td colSpan={5}>Всего с НДС</td>
            <td>
              <input className="cell-input bold" readOnly value={withVAT.toFixed(2)} />
            </td>
          </tr>
        </tbody>
      </table>
      <div className="footer">
        <div>
          Заказчик <br />
          ___________________ /________________________/
        </div>
        <div>
          Подрядчик <br />
          ___________________ /________________________/
        </div>
      </div>
    </div>
  );
};

export default CommercialOfferForm;
