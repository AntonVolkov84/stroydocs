import "./Fileimport.css";
import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";
import Button from "./Button";
import JSZip from "jszip";
import { RowCommercialOfferSecondForm } from "../type";
import SecondCommercialOfferForm from "./SecondCommercialOfferForm";

interface FileImportProps {
  clearMode?: () => void;
  showBackButton?: boolean;
}

function Fileimport({ clearMode, showBackButton = true }: FileImportProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const xmlInputRef = useRef<HTMLInputElement | null>(null);
  const [onParsed, setOnParsed] = useState<RowCommercialOfferSecondForm[] | null>(null);
  const [taxPercent, setTaxPercent] = useState<string | number>("20");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = "";
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data) return;

      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });
      let headerRowIndex = -1;
      let headers: string[] = [];
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i].map((cell: any) => cell?.toString().trim());
        if (row.some((cell: string) => ["Название строки", "Наименование работ"].includes(cell))) {
          headerRowIndex = i;
          headers = row;
          break;
        }
      }

      if (headerRowIndex === -1) {
        console.error("Не удалось найти строку с заголовками");
        return;
      }
      const dataRows = rows.slice(headerRowIndex + 1);
      const parsed: RowCommercialOfferSecondForm[] = dataRows.map((row: any[]) => {
        const rowObj: any = {};
        headers.forEach((header, idx) => {
          rowObj[header.trim()] = row[idx] ?? "";
        });
        const getCell = (keys: string[]) => {
          for (const k of keys) {
            const foundKey = Object.keys(rowObj).find((rk) => rk.trim().toLowerCase() === k.toLowerCase());
            if (foundKey && rowObj[foundKey] !== undefined && rowObj[foundKey] !== null) {
              return rowObj[foundKey].toString();
            }
          }
          return "";
        };
        return {
          name: getCell(["Название строки", "Наименование работ"]),
          unit: getCell(["Единица измерения", "Ед. изм."]),
          quantity: getCell(["Количество", "Кол-во"]) || "0",
          salary: getCell(["Заработная плата", "Осн. зарплата"]) || "0",
          material: getCell(["Материал", "Материалы"]) || "0",
          machine: getCell(["Эксплуатация машин", "Экспл. машин"]) || "0",
        };
      });
      setOnParsed(parsed);
    };
    reader.readAsArrayBuffer(file);
  };

  const importFromXML = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (!buffer) return;
      const parseNumber = (raw?: string | null): number => {
        if (!raw) return 0;
        let s = raw.toString().trim();
        s = s.replace(/\u00A0/g, " ");
        s = s.replace(/[^\d.,-]/g, "");
        if (!s) return 0;
        const hasComma = s.includes(",");
        const hasDot = s.includes(".");
        let normalized = s;
        if (hasComma && !hasDot) {
          normalized = normalized.replace(",", ".");
        } else if (hasComma && hasDot) {
          if (normalized.indexOf(".") < normalized.indexOf(",")) {
            normalized = normalized.replace(/\./g, "").replace(",", ".");
          } else {
            normalized = normalized.replace(/,/g, "");
          }
        }
        const v = parseFloat(normalized);
        return isNaN(v) ? 0 : v;
      };

      const decodeBuffer = (buf: ArrayBuffer): string => {
        const head = new TextDecoder("utf-8").decode(buf.slice(0, 200));
        const encodingMatch = head.match(/encoding="([^"]+)"/i);
        const encoding = encodingMatch ? encodingMatch[1].toLowerCase() : "utf-8";
        try {
          return new TextDecoder(encoding as any, { fatal: false }).decode(buf);
        } catch {
          try {
            return new TextDecoder("windows-1251" as any, { fatal: false }).decode(buf);
          } catch {
            return new TextDecoder("utf-8").decode(buf);
          }
        }
      };

      const getText = (node: Element, tag: string): string =>
        node.getElementsByTagName(tag)[0]?.textContent?.trim() ?? "";

      const getNestedText = (node: Element, path: string[]): string => {
        let cur: Element | null = node;
        for (const p of path) {
          if (!cur) return "";
          const found = cur.getElementsByTagName(p)[0] as Element | undefined;
          if (!found) return "";
          cur = found;
        }
        return cur?.textContent?.trim() ?? "";
      };
      const tryNumberPaths = (node: Element, paths: string[][]) => {
        for (const p of paths) {
          const t = getNestedText(node, p);
          if (t && parseNumber(t) !== 0) return parseNumber(t);
        }
        return 0;
      };
      const parseXmlContent = (content: string) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(content, "application/xml");
        const importedRows: RowCommercialOfferSecondForm[] = [];
        const normalizeUnit = (rawUnit: string) => {
          if (!rawUnit) return { multiplier: 1, unit: "" };
          const trimmed = rawUnit.trim();
          const m = trimmed.match(/^([0-9]+(?:[.,][0-9]+)?)\s*(.+)$/);
          if (m) {
            const mult = parseNumber(m[1]);
            const unit = m[2].trim();
            return { multiplier: mult || 1, unit };
          }
          return { multiplier: 1, unit: trimmed };
        };
        const sections = Array.from(xmlDoc.getElementsByTagName("Section"));
        if (sections.length) {
          sections.forEach((section) => {
            const items = Array.from(section.getElementsByTagName("Item"));
            items.forEach((item) => {
              const costs = Array.from(item.getElementsByTagName("Cost"));
              costs.forEach((cost) => {
                const rawUnit = getText(cost, "Unit") || getText(cost, "UnitType");
                const { multiplier, unit } = normalizeUnit(rawUnit);
                const rawQuantity =
                  getNestedText(cost, ["QuantityTotal"]) ||
                  getNestedText(cost, ["Quantity"]) ||
                  getText(cost, "Quantity") ||
                  "0";
                const quantity = parseNumber(rawQuantity) * multiplier;
                const perUnitCandidates = [
                  ["TotalsUnit", "Current"],
                  ["PerUnit", "PricePerUnitCur"],
                  ["PerUnit", "LaborCosts"],
                  ["PerUnit", "PricePerUnit"],
                ];
                let unitPrice = tryNumberPaths(cost, perUnitCandidates);
                const totalDirect = tryNumberPaths(cost, [
                  ["Totals", "Current", "Direct"],
                  ["Totals", "Current", "Price"],
                  ["Totals", "Current"],
                  ["Totals", "Current", "Total"],
                ]);
                if ((!unitPrice || unitPrice === 0) && totalDirect && quantity) {
                  unitPrice = totalDirect / quantity;
                }
                const salary = tryNumberPaths(cost, [
                  ["Totals", "Current", "WorkersSalary"],
                  ["Totals", "Current", "Salary"],
                  ["Totals", "Current", "WorkersSalary"],
                  ["Totals", "Current", "LaborCosts"],
                ]);
                const material =
                  tryNumberPaths(cost, [
                    ["Totals", "Current", "Materials", "Total"],
                    ["Totals", "Current", "Materials"],
                    ["Materials", "Total"],
                    ["Materials", "Price"],
                  ]) || 0;
                const machine = tryNumberPaths(cost, [
                  ["Totals", "Current", "Machines"],
                  ["Totals", "Current", "MachinesTotal"],
                  ["Machines"],
                ]);

                importedRows.push({
                  name: getText(cost, "Name") || getText(item, "Name") || getText(section, "Name") || "",
                  unit: unit || rawUnit || "",
                  quantity: quantity.toString(),
                  salary: salary.toString(),
                  material: material.toString(),
                  machine: machine.toString(),
                });
                const workers = Array.from(cost.getElementsByTagName("Worker"));
                workers.forEach((w) => {
                  const wName = getText(w, "Name") || "";
                  const wUnit = getText(w, "Unit") || "";
                  const wQty =
                    getNestedText(w, ["ConsumptionTotal"]) ||
                    getText(w, "Consumption") ||
                    getNestedText(w, ["Consumption"]) ||
                    "0";
                  const wTotal = getNestedText(w, ["PriceTotalCur"]) || getNestedText(w, ["PriceTotal"]) || "0";
                  importedRows.push({
                    name: wName,
                    unit: wUnit,
                    quantity: parseNumber(wQty).toString(),
                    salary: parseNumber(wTotal).toString(),
                    material: "0",
                    machine: "0",
                  });
                });
                const machines = Array.from(cost.getElementsByTagName("Machine"));
                machines.forEach((mEl) => {
                  const mName = getText(mEl, "Name") || "";
                  const mUnit = getText(mEl, "Unit") || "";
                  const mQty =
                    getNestedText(mEl, ["ConsumptionTotal"]) ||
                    getText(mEl, "Consumption") ||
                    getNestedText(mEl, ["Consumption"]) ||
                    "0";
                  const mTotal = getNestedText(mEl, ["PriceTotalCur"]) || getNestedText(mEl, ["PriceTotal"]) || "0";
                  importedRows.push({
                    name: mName,
                    unit: mUnit,
                    quantity: parseNumber(mQty).toString(),
                    salary: "0",
                    material: "0",
                    machine: parseNumber(mTotal).toString(),
                  });
                });
                const materials = Array.from(cost.getElementsByTagName("Material"));
                materials.forEach((mat) => {
                  const matName = getText(mat, "Name") || "";
                  const matUnit = getText(mat, "Unit") || "";
                  const matQty =
                    getNestedText(mat, ["ConsumptionTotal"]) ||
                    getText(mat, "Consumption") ||
                    getNestedText(mat, ["Consumption"]) ||
                    "0";
                  const matTotal =
                    getNestedText(mat, ["PriceTotalCur"]) ||
                    getNestedText(mat, ["PriceTotal"]) ||
                    getNestedText(mat, ["PricePerUnitCur"]) ||
                    "0";
                  importedRows.push({
                    name: matName,
                    unit: matUnit,
                    quantity: parseNumber(matQty).toString(),
                    salary: "0",
                    material: parseNumber(matTotal).toString(),
                    machine: "0",
                  });
                });
                console.log("PARSED COST:", {
                  name: getText(cost, "Name"),
                  unit: unit || rawUnit,
                  quantity,
                  unitPrice,
                  totalDirect,
                  salary,
                  material,
                  machine,
                  workers: workers.length,
                  machines: machines.length,
                  materials: materials.length,
                });
              });
            });
          });
        } else {
          const positions = Array.from(xmlDoc.getElementsByTagName("Position"));
          positions.forEach((pos) => {
            const name = pos.getAttribute("Caption") || "";
            const unit = pos.getAttribute("Units") || "";
            const quantity = pos.getElementsByTagName("Quantity")[0]?.getAttribute("Result") || "0";
            const priceBase = pos.getElementsByTagName("PriceBase")[0];
            const salary = priceBase?.getAttribute("PZ") || "0";
            const material = priceBase?.getAttribute("MT") || "0";
            const machine = priceBase?.getAttribute("OZ") || "0";
            importedRows.push({
              name,
              unit,
              quantity,
              salary,
              material,
              machine,
            });
          });
        }
        console.log("IMPORTED ROWS COUNT:", importedRows.length);
        setOnParsed(importedRows);
        const rangingRates = xmlDoc.getElementsByTagName("RangingRates")[0];
        if (rangingRates) {
          setTaxPercent(rangingRates.getAttribute("Mat") || "20");
        }
      };
      const ext = file.name.toLowerCase();
      if (ext.endsWith(".xml") || ext.endsWith(".gge")) {
        const content = decodeBuffer(buffer);
        parseXmlContent(content);
      } else if (ext.endsWith(".gsfx")) {
        try {
          const zip = await JSZip.loadAsync(buffer);
          const xmlFileName = Object.keys(zip.files).find((name) => name.toLowerCase().endsWith(".xml"));
          if (!xmlFileName) {
            console.error("В архиве .gsfx не найден xml-файл");
            return;
          }
          const xmlBuf = await zip.files[xmlFileName].async("arraybuffer");
          const content = decodeBuffer(xmlBuf);
          parseXmlContent(content);
        } catch (err) {
          console.error("Ошибка чтения .gsfx архива:", err);
        }
      } else {
        const content = decodeBuffer(buffer);
        parseXmlContent(content);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="fileimport-wrapper">
      {!onParsed && (
        <div className="fileimport__info">
          Уважаемые пользователи, вы можете загружать файлы с расширением <strong>xls, xlsx, gge, gsfx, xml</strong>.
          После появления данных в таблице, пожалуйста, проверьте их корректность, так как у всех разные заголовки и
          расшифровка может содержать ошибки.{" "}
          <strong>
            Если ваши данные не отображаются, нам нужно добавить ваши теги в скрипт. Пожалуйста, воспользуйтесь
            "Обратной связью" и свяжитесь с нами.
          </strong>
        </div>
      )}
      <Button
        styled={{ marginLeft: 25 }}
        onClick={() => {
          setOnParsed(null);
          fileInputRef.current?.click();
        }}
      >
        📂 Загрузить файл XLS, XLSX
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        accept=".xls,.xlsx"
        onChange={handleFileChange}
        className="file-upload-input"
      />
      {/* <Button
        styled={{ marginLeft: 25 }}
        onClick={() => {
          setOnParsed(null);
          xmlInputRef.current?.click();
        }}
      >
        📂 Загрузить файл XML, GGE, GSFX
      </Button> */}
      <input
        type="file"
        accept=".xml,.gge,.gsfx"
        ref={xmlInputRef}
        onChange={importFromXML}
        className="file-upload-input"
      />
      {onParsed && (
        <SecondCommercialOfferForm clearMode={clearMode} initialRows={onParsed} initialTaxRate={taxPercent} />
      )}
    </div>
  );
}

export default Fileimport;
