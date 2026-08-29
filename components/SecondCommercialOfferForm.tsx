import React, { useState, Dispatch, SetStateAction, useRef, useEffect } from "react";
import "./SecondCommercialOfferForm.css";
import { Mode, SavedOfferDataSecondForm, CalculatorInterface } from "../type";
import Button from "./Button";
import { useAppContext, ExportedRowsType } from "../services/AppContext";
import * as commercialOfferService from "../services/commercialOfferService";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import * as calculatorService from "../services/calculatorService";
import Calculator from "./Calculator";

const defaultRow = {
  name: "",
  unit: "",
  quantity: "",
  salary: "0",
  material: "0",
  machine: "0",
};

// Переименованный локальный тип для предотвращения конфликта импорта RowData
type SecondFormRowData = {
  name: string;
  unit: string;
  quantity: string;
  salary: string;
  material: string;
  machine: string;
};

interface SecondCommercialOfferFormProps {
  setMode?: React.Dispatch<React.SetStateAction<Mode>>;
  initialRows?: ExportedRowsType | null;
  initialTaxRate?: string | number;
  initialTitle?: string;
  key?: string | number;
  showBackButton?: boolean;
  initialOfferId?: number | string;
  onUpdateSuccess?: () => void;
  setExportedRows?: Dispatch<SetStateAction<ExportedRowsType>>;
  setSelectedOffer?: Dispatch<SetStateAction<SavedOfferDataSecondForm | null>>;
  clearMode?: () => void;
}

// Функция нормализации входящего массива данных
const normalizeRows = (incomingRows?: any[] | null): SecondFormRowData[] => {
  if (!incomingRows || incomingRows.length === 0) {
    return [{ ...defaultRow }];
  }

  return incomingRows.map((row) => ({
    name: row.name || "",
    unit: row.unit || "",
    quantity: row.quantity !== undefined && row.quantity !== null ? String(row.quantity) : "0",
    salary: row.salary !== undefined && row.salary !== null ? String(row.salary) : "0",
    material: row.material !== undefined && row.material !== null ? String(row.material) : "0",
    machine: row.machine !== undefined && row.machine !== null ? String(row.machine) : "0",
  }));
};

export default function SecondCommercialOfferForm({
  setMode,
  initialRows,
  initialTaxRate,
  key,
  showBackButton = true,
  initialTitle,
  initialOfferId,
  setExportedRows,
  onUpdateSuccess,
  setSelectedOffer,
  clearMode,
}: SecondCommercialOfferFormProps) {
  const [rows, setRows] = useState<SecondFormRowData[]>(() => normalizeRows(initialRows));

  useEffect(() => {
    if (initialRows && initialRows.length > 0) {
      setRows(normalizeRows(initialRows));
    }
  }, [initialRows]);

  const [taxPercent, setTaxPercent] = useState<string | number>(initialTaxRate || "20");
  const { user, prompt, alert } = useAppContext();
  const inputRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

  const [calculators, setCalculators] = useState<CalculatorInterface[]>([]);
  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);
  const [activeRowForCalc, setActiveRowForCalc] = useState<number | null>(null);
  const [activeCalculator, setActiveCalculator] = useState<any | null>(null);

  const handleChange = (index: number, field: keyof SecondFormRowData, value: string) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  useEffect(() => {
    const fetchCalculators = async () => {
      try {
        const data = await calculatorService.getAllCalculators();
        setCalculators(data || []);
      } catch (err) {
        console.error("Ошибка при получении калькуляторов", err);
      }
    };
    fetchCalculators();
  }, []);

  const handleApplyCalcResult = (value: number) => {
    if (activeRowForCalc !== null) {
      handleChange(activeRowForCalc, "quantity", value.toString());
    }
    setIsCalcModalOpen(false);
    setActiveCalculator(null);
    setActiveRowForCalc(null);
  };

  const handleAddRow = (index: number | null) => {
    const newRow: SecondFormRowData = { name: "", unit: "", quantity: "0", salary: "0", material: "0", machine: "0" };
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

  const parseNumber = (value: string | number) => {
    if (value === undefined || value === null) return 0;
    return parseFloat(value.toString().replace(",", "."));
  };

  const computeUnitPrice = (row: SecondFormRowData) => {
    const s = parseNumber(row.salary) || 0;
    const m = parseNumber(row.material) || 0;
    const mach = parseNumber(row.machine) || 0;
    return s + m + mach;
  };

  const computeTotal = (row: SecondFormRowData) => {
    const q = parseNumber(row.quantity) || 0;
    const unit = computeUnitPrice(row);
    return q * unit;
  };

  const computeTotalSum = (row: SecondFormRowData) => {
    const salary = parseNumber(row.salary) || 0;
    const material = parseNumber(row.material) || 0;
    const machine = parseNumber(row.machine) || 0;
    const quantity = parseNumber(row.quantity) || 0;
    return quantity * (salary + material + machine);
  };

  const totalSalaryCost = rows.reduce((acc, row) => acc + parseNumber(row.salary) * parseNumber(row.quantity), 0);
  const totalMaterialCost = rows.reduce((acc, row) => acc + parseNumber(row.material) * parseNumber(row.quantity), 0);
  const totalMachineCost = rows.reduce((acc, row) => acc + parseNumber(row.machine) * parseNumber(row.quantity), 0);

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

        if (colNumber === 9 || colNumber > 9) {
          cell.alignment = { horizontal: "right" };
        }
      });
    });
    worksheet.addRow([]);
    worksheet.addRow(["", "Заказчик", "", "___________________ /_____________________/"]);
    worksheet.addRow([]);
    worksheet.addRow(["", "Подрядчик", "", "___________________ /_____________________/"]);
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

  const exportInForm0 = async () => {
    const convertedRows = rows.map((row) => {
      const price = computeUnitPrice(row);
      const quantity = parseFloat(row.quantity || "0");
      return {
        name: row.name,
        unit: row.unit,
        quantity,
        price,
      };
    });

    if (setExportedRows) {
      setExportedRows({
        rows: convertedRows,
        taxRate: taxPercent,
      } as any);
    }

    if (setMode) {
      setMode({
        form: true,
        fileimport: false,
        form1: false,
        calculators: false,
        management: false,
        form2: false,
        referencebook: false,
      });
    }
  };

  const exportInBillOfQuantities = async () => {
    const convertedRows = rows.map((row) => {
      return {
        name: row.name,
        unit: row.unit,
        quantity: row.quantity,
      };
    });
    if (setExportedRows) {
      setExportedRows({
        rows: convertedRows,
        taxRate: taxPercent,
      } as any);
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
    <div className="secondcommercial-wrapper commercial-wrapper">
      {!user && (
        <h3 style={{ color: "red", alignSelf: "center", marginBottom: 20 }}>
          Для возможности сохранения рассчетов нужно авторизироваться!
        </h3>
      )}
      {user ? (
        <div className="commercial__controlUnit">
          <Button
            onClick={() => {
              if (setMode) {
                setMode((prev) => ({ ...prev, form1: false }));
              } else if (clearMode) clearMode();
            }}
          >
            ← Назад
          </Button>

          <Button onClick={() => exportInForm0()}>🔀 Экспорт в форму 0</Button>
          <Button onClick={() => exportInBillOfQuantities()}>🔀 Экспорт в ведомость</Button>
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
          {showBackButton && (
            <Button
              onClick={() => {
                if (setMode) {
                  setMode((prev) => ({ ...prev, form1: false }));
                } else if (clearMode) clearMode();
              }}
            >
              ← Назад
            </Button>
          )}
        </div>
      )}
      <h2 className="title">КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ</h2>
      <h4 className="title-line print-only">___________________________________________________</h4>
      <h6 className="title-placeholder print-only">(наименование работ и затрат, наименование объекта)</h6>
      <table className="offer-table" style={{ tableLayout: "fixed", width: "100%" }}>
        <colgroup>
          <col style={{ width: "3%" }} />
          <col style={{ width: "25%" }} />
          <col style={{ width: "5%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "8%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "30px" }} />
          <col style={{ width: "30px" }} />
        </colgroup>
        <thead>
          <tr>
            <th className="title__th" rowSpan={3}>
              № п/п
            </th>
            <th className="title__th" rowSpan={3}>
              Наименование работ
            </th>
            <th className="title__th" rowSpan={3}>
              Ед. изм.
            </th>
            <th className="title__th" rowSpan={3}>
              Кол-во
            </th>
            <th className="title__th" rowSpan={3}>
              Цена за единицу, руб. без НДС
            </th>
            <th className="title__th" colSpan={3}>
              Цена за единицу, руб. без НДС
            </th>
            <th className="title__th" colSpan={4}>
              Стоимость, руб. без НДС
            </th>
            <th className="title__th" rowSpan={3} colSpan={2}>
              Действия
            </th>
          </tr>
          <tr>
            <th className="title__th nested" rowSpan={2}>
              Заработная плата
            </th>
            <th className="title__th nested" rowSpan={2}>
              Материал
            </th>
            <th className="title__th nested" rowSpan={2}>
              Эксплуатация машин
            </th>
            <th className="title__th nested" rowSpan={2}>
              ВСЕГО
            </th>
            <th className="title__th nested" rowSpan={2}>
              Осн. зарплата
            </th>
            <th className="title__th nested" rowSpan={2}>
              Материалы
            </th>
            <th className="title__th nested" rowSpan={2}>
              Экспл. машин
            </th>
          </tr>
          <tr />
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const unitPrice = computeUnitPrice(row);

            return (
              <tr key={i} onFocus={() => setSelectedRowIndex(i)}>
                <td>{i + 1}</td>
                <td style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                  <textarea
                    style={{
                      resize: "none",
                      width: "100%",
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      textAlign: "left",
                    }}
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
                <td className="calc-quantities">
                  <div className="calc-quantities-wrapper">
                    <input
                      value={row.quantity}
                      onChange={(e) => {
                        handleChange(i, "quantity", e.target.value);
                      }}
                      className="cell-input smaller"
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
                  </div>
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
                <td>{computeTotalSum(row).toFixed(3)}</td>
                <td>{(parseNumber(row.salary) * parseNumber(row.quantity) || 0).toFixed(3)}</td>
                <td>{(parseNumber(row.material) * parseNumber(row.quantity) || 0).toFixed(3)}</td>
                <td>{(parseNumber(row.machine) * parseNumber(row.quantity) || 0).toFixed(3)}</td>
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
}
