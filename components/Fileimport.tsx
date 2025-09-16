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

      // Получаем массив массивов, чтобы обрабатывать строки динамически
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });

      // Находим индекс строки, где есть заголовки
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

      // Данные начинаются со следующей строки после заголовков
      const dataRows = rows.slice(headerRowIndex + 1);

      const parsed: RowCommercialOfferSecondForm[] = dataRows.map((row: any[]) => {
        const rowObj: any = {};
        headers.forEach((header, idx) => {
          rowObj[header.trim()] = row[idx] ?? "";
        });

        // Получаем значения с проверкой синонимов
        const getCell = (keys: string[]) => {
          for (const k of keys) {
            const foundKey = Object.keys(rowObj).find((rk) => rk.trim().toLowerCase() === k.toLowerCase());
            if (foundKey && rowObj[foundKey] !== undefined && rowObj[foundKey] !== null) {
              return rowObj[foundKey].toString();
            }
          }
          return "";
        };

        // Числа с запятой оставляем как строки
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

  // const importFromXML = (event: React.ChangeEvent<HTMLInputElement>) => {

  //   const file = event.target.files?.[0];
  //   if (!file) return;
  //   const reader = new FileReader();
  //   reader.onload = (e) => {
  //     const buffer = e.target?.result as ArrayBuffer;
  //     const head = new TextDecoder("utf-8").decode(buffer.slice(0, 200));
  //     const encodingMatch = head.match(/encoding="([^"]+)"/i);
  //     const encoding = encodingMatch ? encodingMatch[1].toLowerCase() : "utf-8";
  //     let content: string;
  //     try {
  //       const decoder = new TextDecoder(encoding as any, { fatal: false });
  //       content = decoder.decode(buffer);
  //     } catch (e) {
  //       try {
  //         const decoder = new TextDecoder("windows-1251" as any, { fatal: false });
  //         content = decoder.decode(buffer);
  //       } catch {
  //         content = new TextDecoder("utf-8").decode(buffer);
  //       }
  //     }
  //     const parser = new DOMParser();
  //     const xmlDoc = parser.parseFromString(content, "application/xml");
  //     const positions = Array.from(xmlDoc.getElementsByTagName("Position"));
  //     const importedRows: RowCommercialOfferSecondForm[] = positions.map((pos) => {
  //       const name = pos.getAttribute("Caption") || "";
  //       const unit = pos.getAttribute("Units") || "";
  //       const quantity = pos.getElementsByTagName("Quantity")[0]?.getAttribute("Result") || "0";
  //       const priceBase = pos.getElementsByTagName("PriceBase")[0];
  //       const salary = priceBase?.getAttribute("PZ") || "0";
  //       const material = priceBase?.getAttribute("MT") || "0";
  //       const machine = priceBase?.getAttribute("OZ") || "0";
  //       return {
  //         name,
  //         unit,
  //         quantity,
  //         salary,
  //         material,
  //         machine,
  //       };
  //     });
  //     setOnParsed(importedRows);
  //     const rangingRates = xmlDoc.getElementsByTagName("RangingRates")[0];
  //     if (rangingRates) {
  //       setTaxPercent(rangingRates.getAttribute("Mat") || "20");
  //     }
  //   };

  //   reader.readAsArrayBuffer(file);
  // };
  function parseXmlContent(content: string) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, "application/xml");

    const positions = Array.from(xmlDoc.getElementsByTagName("Position"));
    const importedRows: RowCommercialOfferSecondForm[] = positions.map((pos) => {
      const name = pos.getAttribute("Caption") || "";
      const unit = pos.getAttribute("Units") || "";
      const quantity = pos.getElementsByTagName("Quantity")[0]?.getAttribute("Result") || "0";

      const priceBase = pos.getElementsByTagName("PriceBase")[0];
      const salary = priceBase?.getAttribute("PZ") || "0";
      const material = priceBase?.getAttribute("MT") || "0";
      const machine = priceBase?.getAttribute("OZ") || "0";

      return { name, unit, quantity, salary, material, machine };
    });

    setOnParsed(importedRows);

    const rangingRates = xmlDoc.getElementsByTagName("RangingRates")[0];
    if (rangingRates) {
      setTaxPercent(rangingRates.getAttribute("Mat") || "20");
    }
  }

  // Чтение файла с учётом кодировки
  function decodeBuffer(buffer: ArrayBuffer): string {
    const head = new TextDecoder("utf-8").decode(buffer.slice(0, 200));
    const encodingMatch = head.match(/encoding="([^"]+)"/i);
    const encoding = encodingMatch ? encodingMatch[1].toLowerCase() : "utf-8";

    try {
      return new TextDecoder(encoding as any, { fatal: false }).decode(buffer);
    } catch {
      try {
        return new TextDecoder("windows-1251" as any, { fatal: false }).decode(buffer);
      } catch {
        return new TextDecoder("utf-8").decode(buffer);
      }
    }
  }

  const importFromXML = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (!buffer) return;

      // функция для декодирования
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

      const parseXmlContent = (content: string) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(content, "application/xml");
        let importedRows: RowCommercialOfferSecondForm[] = [];

        // Если есть Section → новый формат ГРАНД
        const sections = Array.from(xmlDoc.getElementsByTagName("Section"));
        if (sections.length) {
          sections.forEach((section) => {
            const items = Array.from(section.getElementsByTagName("Item"));
            items.forEach((item) => {
              const costs = Array.from(item.getElementsByTagName("Cost"));
              costs.forEach((cost) => {
                importedRows.push({
                  name: cost.getElementsByTagName("Name")[0]?.textContent || "",
                  unit: cost.getElementsByTagName("Unit")[0]?.textContent || "",
                  quantity: cost.getElementsByTagName("Quantity")[0]?.textContent || "0",
                  salary: cost.getElementsByTagName("WorkersSalary")[0]?.textContent || "0",
                  material:
                    cost.getElementsByTagName("Materials")[0]?.getElementsByTagName("Total")[0]?.textContent || "0",
                  machine: cost.getElementsByTagName("Machines")[0]?.textContent || "0",
                });
              });
            });
          });
        } else {
          // старый формат с Position
          const positions = Array.from(xmlDoc.getElementsByTagName("Position"));
          importedRows = positions.map((pos) => {
            const name = pos.getAttribute("Caption") || "";
            const unit = pos.getAttribute("Units") || "";
            const quantity = pos.getElementsByTagName("Quantity")[0]?.getAttribute("Result") || "0";
            const priceBase = pos.getElementsByTagName("PriceBase")[0];
            const salary = priceBase?.getAttribute("PZ") || "0";
            const material = priceBase?.getAttribute("MT") || "0";
            const machine = priceBase?.getAttribute("OZ") || "0";
            return { name, unit, quantity, salary, material, machine };
          });
        }

        setOnParsed(importedRows);

        // налоговые ставки, если есть
        const rangingRates = xmlDoc.getElementsByTagName("RangingRates")[0];
        if (rangingRates) {
          setTaxPercent(rangingRates.getAttribute("Mat") || "20");
        }
      };

      // Проверяем, XML или архив GSFX/GGE
      const ext = file.name.toLowerCase();
      if (ext.endsWith(".xml") || ext.endsWith(".gge")) {
        const content = decodeBuffer(buffer);
        parseXmlContent(content);
      } else if (ext.endsWith(".gsfx") || ext.endsWith(".gge")) {
        const zip = await JSZip.loadAsync(buffer);
        const xmlFile = Object.keys(zip.files).find((name) => name.toLowerCase().endsWith(".xml"));
        if (xmlFile) {
          const xmlBuffer = await zip.files[xmlFile].async("arraybuffer");
          const content = decodeBuffer(xmlBuffer);
          parseXmlContent(content);
        } else {
          console.error("В архиве нет XML файла");
        }
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
      <Button
        styled={{ marginLeft: 25 }}
        onClick={() => {
          setOnParsed(null);
          xmlInputRef.current?.click();
        }}
      >
        📂 Загрузить файл XML, GGE, GSFX
      </Button>
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
