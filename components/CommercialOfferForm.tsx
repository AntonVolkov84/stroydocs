import { useState } from "react";
import "./CommercialOfferForm.css";
import Button from "./Button";
import { Mode } from "../type";
import { Trash2 } from "lucide-react";
import { useAppContext } from "../services/AppContext";

interface RowData {
  name: string;
  unit: string;
  type: "работы" | "материалы" | "механизмы" | "оборудование";
  quantity: number;
  price: number;
}

interface CommercialOfferFormProps {
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
}

const CommercialOfferForm = ({ setMode }: CommercialOfferFormProps) => {
  const [rows, setRows] = useState<RowData[]>([
    {
      name: "",
      unit: "",
      type: "работы",
      quantity: 0,
      price: 0,
    },
  ]);
  const { user } = useAppContext();

  const [taxRate, setTaxRate] = useState(20);

  const addRow = (type: RowData["type"]) => {
    setRows((prev) => [...prev, { name: "", unit: "", type, quantity: 0, price: 0 }]);
  };

  const deleteRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof RowData, value: string) => {
    const newRows = [...rows];
    const parsed = field === "name" || field === "unit" || field === "type" ? value : parseFloat(value) || 0;
    newRows[index] = { ...newRows[index], [field]: parsed };
    setRows(newRows);
  };

  const computedTotals = rows.map((r) => +(r.quantity * r.price).toFixed(2));
  const total = computedTotals.reduce((sum, val) => sum + val, 0);

  const summary = {
    salary: rows.filter((r) => r.type === "работы").reduce((sum, r) => sum + r.quantity * r.price, 0),
    materials: rows.filter((r) => r.type === "материалы").reduce((sum, r) => sum + r.quantity * r.price, 0),
    machines: rows.filter((r) => r.type === "механизмы").reduce((sum, r) => sum + r.quantity * r.price, 0),
    equipment: rows.filter((r) => r.type === "оборудование").reduce((sum, r) => sum + r.quantity * r.price, 0),
  };

  const tax = +((summary.salary + summary.materials + summary.machines + summary.equipment) * (taxRate / 100)).toFixed(
    2
  );
  const withVAT = +(total + tax).toFixed(2);

  return (
    <div className="commercial-wrapper">
      <div className="commercial__controlUnit">
        <Button styled={{ marginBottom: 20 }} onClick={() => setMode((prev) => ({ form: false, calculators: false }))}>
          ← Назад
        </Button>

        {user ? <Button styled={{ marginBottom: 20 }}>Сохранить</Button> : null}
        {user ? <Button styled={{ marginBottom: 20 }}>Распечатать</Button> : null}
      </div>

      <div className="add-buttons" style={{ display: "flex", gap: 10, marginBottom: 30 }}>
        {["работы", "материалы", "механизмы", "оборудование"].map((type) => (
          <Button key={type} onClick={() => addRow(type as RowData["type"])}>
            Добавить: {type}
          </Button>
        ))}
      </div>

      <h2 className="title">КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ</h2>

      <table className="offer-table">
        <thead>
          <tr>
            <th>№ п/п</th>
            <th>Наименование работ и затрат</th>
            <th>Ед. изм.</th>
            <th>Тип</th>
            <th>Количество</th>
            <th>Цена, руб.</th>
            <th>Стоимость, руб</th>
            <th></th>
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
                <select
                  className="cell-input small"
                  value={row.type}
                  onChange={(e) => handleChange(i, "type", e.target.value)}
                >
                  <option value="работы">работы</option>
                  <option value="материалы">материалы</option>
                  <option value="механизмы">механизмы</option>
                  <option value="оборудование">оборудование</option>
                </select>
              </td>
              <td>
                <input
                  type="number"
                  step="0.000001"
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
              <td>
                <button className="icon-button" onClick={() => deleteRow(i)}>
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}

          <tr>
            <td colSpan={6}>ИТОГ без НДС</td>
            <td>
              <input className="cell-input" readOnly value={total.toFixed(2)} />
            </td>
          </tr>
          <tr>
            <td colSpan={6}>- Заработная плата</td>
            <td>
              <input className="cell-input" readOnly value={summary.salary.toFixed(2)} />
            </td>
          </tr>
          <tr>
            <td colSpan={6}>- Материал</td>
            <td>
              <input className="cell-input" readOnly value={summary.materials.toFixed(2)} />
            </td>
          </tr>
          <tr>
            <td colSpan={6}>- Эксплуатация машин</td>
            <td>
              <input className="cell-input" readOnly value={summary.machines.toFixed(2)} />
            </td>
          </tr>
          <tr>
            <td colSpan={6}>- Оборудование</td>
            <td>
              <input className="cell-input" readOnly value={summary.equipment.toFixed(2)} />
            </td>
          </tr>
          <tr>
            <td colSpan={5}>- Налоги </td>
            <td>
              <input
                type="number"
                step="0.01"
                min="0"
                className="cell-input smaller"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              />
              %
            </td>
            <td>
              <input className="cell-input" readOnly value={tax.toFixed(2)} />
            </td>
          </tr>
          <tr>
            <td colSpan={6}>Всего с НДС</td>
            <td>
              <input className="cell-input bold" readOnly value={withVAT.toFixed(2)} />
            </td>
          </tr>
        </tbody>
      </table>

      <div className="footer">
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

export default CommercialOfferForm;
