import { useState, Dispatch, SetStateAction, useRef, useEffect } from "react";
import "./CommercialOfferForm.css";
import Button from "./Button";
import { Mode } from "../type";
import { Trash2, Copy } from "lucide-react";
import { useAppContext, ExportedRowsType } from "../services/AppContext";
import { SavedOfferData, RowData, CalculatorInterface } from "../type";
import * as commercialOfferService from "../services/commercialOfferService";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import * as calculatorService from "../services/calculatorService";
import Calculator from "./Calculator";

interface CommercialOfferFormProps {
  setMode?: React.Dispatch<React.SetStateAction<Mode>>;
  initialRows?: RowData[] | ExportedRowsType | null;
  initialTaxRate?: number | string;
  initialTitle?: string;
  showBackButton?: boolean;
  key?: string | number;
  initialOfferId?: number | string;
  onUpdateSuccess?: () => void;
  clearMode?: () => void;
  setExportedRows?: Dispatch<SetStateAction<ExportedRowsType>>;
  setSelectedOffer?: Dispatch<SetStateAction<SavedOfferData | null>>;
}

// Функция-конвертер: приводит входящий массив любого типа к строгому формату RowData[]
const normalizeRows = (incomingRows?: any | null): RowData[] => {
  if (!incomingRows) {
    return [{ name: "", unit: "", type: "работы", quantity: 0, price: 0 }];
  }
  const rowsArray = Array.isArray(incomingRows) ? incomingRows : incomingRows.rows;
  if (!Array.isArray(rowsArray) || rowsArray.length === 0) {
    return [{ name: "", unit: "", type: "работы", quantity: 0, price: 0 }];
  }

  return rowsArray.map((row) => ({
    name: row.name || "",
    unit: row.unit || "",
    type: row.type || "работы",
    quantity: Number(row.quantity) || 0,
    price: Number(row.price || row.cost || 0),
  }));
};

const CommercialOfferForm = ({
  setMode,
  initialRows,
  initialTaxRate,
  showBackButton = true,
  initialTitle,
  initialOfferId,
  key,
  clearMode,
  onUpdateSuccess,
  setExportedRows,
  setSelectedOffer,
}: CommercialOfferFormProps) => {
  const [rows, setRows] = useState<RowData[]>(() => normalizeRows(initialRows));

  // Безопасное получение списка строк для проверок
  const extractedRowsList = Array.isArray(initialRows) ? initialRows : initialRows?.rows;

  // 2. Обновление state при задержке пропсов
  useEffect(() => {
    if (extractedRowsList && extractedRowsList.length > 0) {
      setRows(normalizeRows(initialRows));
    }
  }, [initialRows]);

  // Функция для первичного получения налога
  const getInitialTaxRate = (): number | string => {
    if (initialRows && !Array.isArray(initialRows) && typeof initialRows === "object" && "taxRate" in initialRows) {
      return (initialRows as ExportedRowsType).taxRate ?? initialTaxRate ?? 20;
    }
    return initialTaxRate ?? 20;
  };

  const [taxRate, setTaxRate] = useState<number | string>(getInitialTaxRate);

  // Синхронизация налога
  useEffect(() => {
    if (initialRows && typeof initialRows === "object" && !Array.isArray(initialRows) && "taxRate" in initialRows) {
      const extractedTax = (initialRows as ExportedRowsType).taxRate;
      if (extractedTax !== undefined && extractedTax !== null) {
        setTaxRate(extractedTax);
      }
    } else if (initialTaxRate !== undefined) {
      setTaxRate(initialTaxRate);
    }
  }, [initialRows, initialTaxRate]);

  const { user, prompt, alert } = useAppContext();

  const inputRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [calculators, setCalculators] = useState<CalculatorInterface[]>([]);
  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);
  const [activeRowForCalc, setActiveRowForCalc] = useState<number | null>(null);
  const [activeCalculator, setActiveCalculator] = useState<any | null>(null);

  const addRow = (type: RowData["type"], index?: number) => {
    const newRow: RowData = { name: "", unit: "", type, quantity: 0, price: 0 };

    setRows((prev) => {
      let newRows;
      if (index === undefined || index < 0 || index >= prev.length) {
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

  useEffect(() => {
    const fetchCalculators = async () => {
      try {
        const data = await calculatorService.getAllCalculators();
        setCalculators(data || []); // Если пришел null, записываем пустой массив []
      } catch (err) {
        console.error("Ошибка при получении калькуляторов", err);
      }
    };
    fetchCalculators();
  }, []);

  // 4. Функция применения результата калькулятора к строке
  const handleApplyCalcResult = (value: number) => {
    if (activeRowForCalc !== null) {
      handleChange(activeRowForCalc, "quantity", value.toString());
    }
    // Закрываем модальное окно и сбрасываем выбор
    setIsCalcModalOpen(false);
    setActiveCalculator(null);
    setActiveRowForCalc(null);
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
      const { name, unit, price } = newRows[index];
      const matchingRow = newRows.find(
        (r, i) => i !== index && r.name.trim() === name.trim() && r.unit.trim() === unit.trim() && r.price === price,
      );
      if (matchingRow) {
        newRows[index].type = matchingRow.type;
      }
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

  const tax = +((summary.salary + summary.materials + summary.machines + summary.equipment) * (+taxRate / 100)).toFixed(
    2,
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
    console.log(initialOfferId);
    if (!title || !user || !initialOfferId) return;
    const payload = {
      offerId: initialOfferId,
      userId: user.id,
      title,
      rows: rows,
      taxRate,
    };
    console.log(payload);

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
  const exportToExcel = async (offer: { rows: RowData[]; total: number }) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Коммерческое предложение");
    worksheet.mergeCells("A1", "G1");
    const app2Cell1 = worksheet.getCell("E1");
    app2Cell1.value = "Приложение №2";
    app2Cell1.font = { bold: true };
    app2Cell1.alignment = { horizontal: "right" };
    worksheet.addRow([]);
    worksheet.mergeCells("A3", "G3");
    const app2Cell2 = worksheet.getCell("C3");
    app2Cell2.value = `к Договору подряда на выполнение работ № ________   от ____________   202___ г.`;
    app2Cell2.alignment = { horizontal: "right" };
    worksheet.addRow([]);
    worksheet.addRow([]);
    worksheet.mergeCells("A6", "G6");
    const titleCell = worksheet.getCell("A6");
    titleCell.value = "КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ";
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };

    worksheet.addRow([]);
    worksheet.addRow([]);
    const headerRow = worksheet.addRow([
      "№",
      "Наименование работ и затрат",
      "Ед. изм.",
      "Количество",
      "Цена, руб.",
      "Стоимость, руб.",
      "Тип",
    ]);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: "center" };
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
    offer.rows.forEach((row, index) => {
      const cost = +(row.quantity * row.price).toFixed(2);
      const rowData = [index + 1, row.name, row.unit, row.quantity, row.price, cost, row.type];
      const newRow = worksheet.addRow(rowData);
      newRow.getCell(2).alignment = { wrapText: true, horizontal: "left", vertical: "middle" };
      const approxLines = Math.ceil(row.name.length / 40);
      newRow.height = approxLines * 17;
      newRow.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        if (typeof cell.value === "number") {
          cell.alignment = { horizontal: "right" };
        }
      });
    });
    worksheet.addRow([]);
    const summarySalary = rows.filter((r) => r.type === "работы").reduce((sum, r) => sum + r.quantity * r.price, 0);
    const summaryMaterials = rows
      .filter((r) => r.type === "материалы")
      .reduce((sum, r) => sum + r.quantity * r.price, 0);
    const summaryMachines = rows
      .filter((r) => r.type === "механизмы")
      .reduce((sum, r) => sum + r.quantity * r.price, 0);
    const summaryEquipment = rows
      .filter((r) => r.type === "оборудование")
      .reduce((sum, r) => sum + r.quantity * r.price, 0);
    const taxAmount = +(
      (summarySalary + summaryMaterials + summaryMachines + summaryEquipment) *
      (+taxRate / 100)
    ).toFixed(2);
    const totalWithTax = +(offer.total + taxAmount).toFixed(2);
    const summaryData = [
      ["", "ИТОГ без налогов", "", "", "", offer.total, ""],
      ["", "- Оплата труда", "", "", "", summarySalary.toFixed(2), ""],
      ["", "- Материал", "", "", "", summaryMaterials.toFixed(2), ""],
      ["", "- Эксплуатация машин", "", "", "", summaryMachines.toFixed(2), ""],
      ["", "- Оборудование", "", "", "", summaryEquipment.toFixed(2), ""],
      ["", "- Налоги", "", "", `${taxRate}%`, taxAmount.toFixed(2), ""],
      ["", "ВСЕГО с налогами", "", "", "", totalWithTax.toFixed(2), ""],
    ];
    summaryData.forEach((data) => {
      const row = worksheet.addRow(data);
      row.font = { bold: data[1].toString().includes("ИТОГ") || data[1].toString().includes("ВСЕГО") };
      row.eachCell((cell, colNumber) => {
        if (colNumber === 7) {
          cell.border = {
            left: { style: "thin" },
          };
        } else {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        }

        if (colNumber === 6) {
          cell.alignment = { horizontal: "right" };
        }
      });
    });
    worksheet.addRow([]);
    worksheet.addRow([]);
    const customerRow = worksheet.addRow(["Заказчик", "", "", "___________________ /_____________________/"]);
    worksheet.addRow([]);
    const contractorRow = worksheet.addRow(["Подрядчик", "", "", "___________________ /_____________________/"]);
    [customerRow, contractorRow].forEach((r) => {
      r.getCell(1).alignment = { horizontal: "left" };
      r.getCell(7).alignment = { horizontal: "left" };
    });
    worksheet.columns = [
      { width: 5 },
      { width: 40 },
      { width: 10 },
      { width: 15 },
      { width: 15 },
      { width: 20 },
      { width: 15 },
    ];
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "Коммерческое_предложение форма 0.xlsx");
  };
  const exportInBillOfQuantities = async () => {
    const convertedRows = rows.map((row) => {
      return {
        name: row.name,
        unit: row.unit,
        quantity: row.quantity,
        type: row.type,
        price: row.price,
      };
    });
    if (setExportedRows) {
      setExportedRows(convertedRows);
    }
    if (setMode) {
      setMode({
        form: false,
        form1: false,
        calculators: false,
        management: false,
        form2: true,
        referencebook: false,
        fileimport: false,
      });
    }
  };
  return (
    <div className="commercial-wrapper">
      <div className="commercial__controlUnit">
        <Button
          styled={{ marginBottom: 20 }}
          onClick={() => {
            if (clearMode) clearMode();
          }}
        >
          ← Назад
        </Button>

        {!user && (
          <h3 style={{ color: "red", alignSelf: "center", marginBottom: 20 }}>
            Для возможности сохранения рассчетов нужно авторизироваться!
          </h3>
        )}
        {(user?.subscribe || user?.unlimited) && (
          <Button styled={{ marginBottom: 20 }} onClick={() => exportInBillOfQuantities()}>
            🔀 Экспорт в ведомость
          </Button>
        )}
        {user ? (
          <>
            {!initialRows ? (
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
        {(user?.subscribe || user?.unlimited) && (
          <Button styled={{ marginBottom: 20 }} onClick={() => window.print()}>
            🖨️ Печать
          </Button>
        )}
        {(user?.subscribe || user?.unlimited) && (
          <Button styled={{ marginBottom: 20 }} onClick={() => exportToExcel({ rows, total })}>
            📊 Выгрузить в Excel
          </Button>
        )}
      </div>
      <div
        style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginBottom: 20, marginRight: 80 }}
      >
        <div className="print-only">
          <strong>Приложение №2</strong>
        </div>
        <div className="print-only">
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
            <tr key={i} onFocus={() => setSelectedRowIndex(i)}>
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
                      inputRefs.current[i] = el;
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
                  className="cell-input smallest no-spinner"
                  value={row.quantity}
                  min="0"
                  onChange={(e) => handleChange(i, "quantity", e.target.value)}
                />
                <button
                  type="button"
                  className="icon-button"
                  title="Рассчитать через калькулятор"
                  onClick={() => {
                    setActiveRowForCalc(i);
                    setIsCalcModalOpen(true);
                  }}
                >
                  🧮
                </button>
              </td>
              <td>
                <input
                  type="number"
                  className="cell-input smallest no-spinner"
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
                  <Button
                    key={type}
                    onClick={() => {
                      if (selectedRowIndex !== null) addRow(type as RowData["type"], selectedRowIndex);
                    }}
                  >
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
      {isCalcModalOpen && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="modal-content"
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "8px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
              <h3>Выберите калькулятор</h3>
              <button
                className="button_btn button_btn"
                onClick={() => {
                  setIsCalcModalOpen(false);
                  setActiveCalculator(null);
                }}
              >
                ✕
              </button>
            </div>

            {!activeCalculator ? (
              // Список калькуляторов для выбора
              <ul style={{ listStyle: "none", padding: 0 }}>
                {calculators.map((calc) => (
                  <li key={calc.id || calc.title} style={{ marginBottom: "10px" }}>
                    <Button styled={{ width: "100%", textAlign: "left" }} onClick={() => setActiveCalculator(calc)}>
                      {calc.title}
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              // Экран самого калькулятора
              <div>
                <Button styled={{ marginBottom: "15px" }} onClick={() => setActiveCalculator(null)}>
                  ← К списку калькуляторов
                </Button>
                <Calculator
                  mode={{
                    form: false,
                    form1: false,
                    calculators: activeCalculator,
                    management: false,
                    form2: false,
                    referencebook: false,
                    fileimport: false,
                  }}
                  setMode={() => {}}
                  onApplyResult={handleApplyCalcResult}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommercialOfferForm;
