import { useState, Dispatch, SetStateAction } from "react";
import "./CommercialOfferForm.css";
import Button from "./Button";
import { Mode } from "../type";
import { Trash2, Copy } from "lucide-react";
import { useAppContext } from "../services/AppContext";
import { SavedOfferData } from "../type";
import * as commercialOfferService from "../services/commercialOfferService";

interface RowData {
  name: string;
  unit: string;
  type: "работы" | "материалы" | "механизмы" | "оборудование";
  quantity: number;
  price: number;
}

interface CommercialOfferFormProps {
  setMode?: React.Dispatch<React.SetStateAction<Mode>>;
  initialRows?: RowData[];
  initialTaxRate?: number;
  initialTitle?: string;
  showBackButton?: boolean;
  key: string | number;
  initialOfferId?: number | string;
  onUpdateSuccess?: () => void;
  setSelectedOffer?: Dispatch<SetStateAction<SavedOfferData | null>>;
}

const CommercialOfferForm = ({
  setMode,
  initialRows,
  initialTaxRate,
  showBackButton = true,
  initialTitle,
  initialOfferId,
  key,
  onUpdateSuccess,
  setSelectedOffer,
}: CommercialOfferFormProps) => {
  const [rows, setRows] = useState<RowData[]>(
    initialRows || [{ name: "", unit: "", type: "работы", quantity: 0, price: 0 }]
  );
  const { user, prompt, alert } = useAppContext();

  const [taxRate, setTaxRate] = useState(initialTaxRate || 20);

  const addRow = (type: RowData["type"]) => {
    setRows((prev) => [...prev, { name: "", unit: "", type, quantity: 0, price: 0 }]);
  };
  const duplicateRow = (index: number) => {
    const newRows = [...rows, { ...rows[index] }];
    setRows(newRows);
  };
  const deleteRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };
  const sanitizeInput = (value: string) => {
    return value.replace(/<\/?[^>]+(>|$)/g, "");
  };
  const handleChange = (index: number, field: keyof RowData, value: string) => {
    const newRows = [...rows];

    if (field === "type") {
      const newType = value as RowData["type"];
      const { name, unit, price } = rows[index];
      for (let i = 0; i < newRows.length; i++) {
        if (
          newRows[i].name.trim() === name.trim() &&
          newRows[i].unit.trim() === unit.trim() &&
          newRows[i].price === price
        ) {
          newRows[i] = { ...newRows[i], type: newType };
        }
      }
    } else {
      const parsed = field === "name" || field === "unit" ? sanitizeInput(value) : parseFloat(value) || 0;
      newRows[index] = { ...newRows[index], [field]: parsed };
    }
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
  const handleSave = async () => {
    const title = await prompt({
      title: "Придумайте название сохраняемой форме",
      message: "",
      placeholder: "Название",
    });
    if (!title || !user) return;
    const payload = {
      userId: user.id,
      title,
      rows: rows,
      taxRate,
    };
    try {
      await commercialOfferService.saveCommercialOffer(payload);
      await alert({
        title: "Коммерческое предложение успешно сохранено!",
        message: "",
      });
    } catch (error) {
      console.error("Ошибка при сохранении КП:", error);
      await alert({
        title: "Произошла ошибка при сохранении.",
        message: "",
      });
    }
  };
  const handleUpdate = async () => {
    const title = await prompt({
      title: "Изменения вступают в силу, название оставляем?",
      message: initialTitle,
      placeholder: "Название",
    });

    if (!title || !user || !initialOfferId) return;
    const payload = {
      offerId: initialOfferId,
      userId: user.id,
      title,
      rows: rows,
      taxRate,
    };

    try {
      await commercialOfferService.updateCommercialOffer(payload);
      await alert({
        title: "Коммерческое предложение успешно обновлено!",
        message: "",
      });
      setSelectedOffer?.(null);
      if (onUpdateSuccess) onUpdateSuccess();
    } catch (error) {
      console.error("Ошибка при сохранении КП:", error);
      await alert({
        title: "Произошла ошибка при сохранении.",
        message: "",
      });
    }
  };
  return (
    <div className="commercial-wrapper">
      <div className="commercial__controlUnit">
        {showBackButton && (
          <Button
            styled={{ marginBottom: 20 }}
            onClick={() => {
              if (setMode) {
                setMode({ form: false, calculators: false, form1: false });
              } else {
                console.warn("setMode не передан, ничего не делаем");
              }
            }}
          >
            ← Назад
          </Button>
        )}
        {!user && (
          <h3 style={{ color: "red", alignSelf: "center", marginBottom: 20 }}>
            Для возможности сохранения рассчетов нужно авторизироваться!
          </h3>
        )}
        {user ? (
          <>
            {showBackButton ? (
              <Button onClick={() => handleSave()} styled={{ marginBottom: 20 }}>
                Сохранить
              </Button>
            ) : (
              <Button onClick={() => handleUpdate()} styled={{ marginBottom: 20 }}>
                Изменить
              </Button>
            )}
          </>
        ) : null}
        {user ? (
          <Button styled={{ marginBottom: 20 }} onClick={() => window.print()}>
            🖨️ Печать
          </Button>
        ) : null}
      </div>
      <div
        style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginBottom: 20, marginRight: 80 }}
      >
        <div>
          <strong>Приложение №2</strong>
        </div>
        <div>
          к Договору подряда на выполнение работ №{" "}
          <span style={{ borderBottom: "1px solid black", padding: "0 50px" }}></span>
          &nbsp; от <span style={{ borderBottom: "1px solid black", padding: "0 50px" }}></span>
          &nbsp; 202___ г.
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
            <th className="col-type">Тип</th>
            <th className="test-col"></th>
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
                  className="cell-input small"
                  value={row.unit}
                  onChange={(e) => handleChange(i, "unit", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  step="0.000001"
                  className="cell-input smaller"
                  value={row.quantity}
                  min="0"
                  onChange={(e) => handleChange(i, "quantity", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  className="cell-input smaller"
                  value={row.price}
                  step="0.01"
                  min="0"
                  onChange={(e) => handleChange(i, "price", e.target.value)}
                />
              </td>
              <td>
                <input type="text" readOnly className="cell-input" value={computedTotals[i].toFixed(2)} />
              </td>
              <td className="col-type">
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
            <td colSpan={8} style={{ padding: "10px", textAlign: "center" }}>
              <div style={{ display: "inline-flex", gap: "10px" }}>
                {["работы", "материалы", "механизмы", "оборудование"].map((type) => (
                  <Button key={type} onClick={() => addRow(type as RowData["type"])}>
                    Добавить: {type}
                  </Button>
                ))}
              </div>
            </td>
          </tr>
          <tr className="result-row total-without-tax">
            <td style={{ textAlign: "end" }} colSpan={5}>
              ИТОГ без налогов
            </td>
            <td className="result-row-print">
              <input className="cell-input" readOnly value={total.toFixed(2)} />
            </td>
          </tr>
          <tr className="result-row salary">
            <td style={{ textAlign: "end" }} colSpan={5}>
              - Оплата труда
            </td>
            <td className="result-row-print">
              <input className="cell-input" readOnly value={summary.salary.toFixed(2)} />
            </td>
          </tr>
          <tr className="result-row materials">
            <td style={{ textAlign: "end" }} colSpan={5}>
              - Материал
            </td>
            <td className="result-row-print">
              <input className="cell-input" readOnly value={summary.materials.toFixed(2)} />
            </td>
          </tr>
          <tr className="result-row machines">
            <td style={{ textAlign: "end" }} colSpan={5}>
              - Эксплуатация машин
            </td>
            <td className="result-row-print">
              <input className="cell-input" readOnly value={summary.machines.toFixed(2)} />
            </td>
          </tr>
          <tr className="result-row equipment">
            <td style={{ textAlign: "end" }} colSpan={5}>
              - Оборудование
            </td>
            <td className="result-row-print">
              <input className="cell-input" readOnly value={summary.equipment.toFixed(2)} />
            </td>
          </tr>
          <tr className="result-row tax">
            <td colSpan={5}>
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                <span>- Налоги</span>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="cell-input smaller"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    style={{ width: "60px" }}
                  />
                  <span>%</span>
                </div>
              </div>
            </td>
            <td className="result-row-print">
              <input className="cell-input" readOnly value={tax.toFixed(2)} />
            </td>
          </tr>
          <tr className="result-row total-with-vat">
            <td style={{ textAlign: "end" }} colSpan={5}>
              ВСЕГО с налогами
            </td>
            <td className="result-row-print">
              <input className="cell-input bold" readOnly value={withVAT.toFixed(2)} />
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

export default CommercialOfferForm;
