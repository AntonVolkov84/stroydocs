import "./ReferenceBook.css";
import { useEffect, useState } from "react";
import * as referenceBookService from "../services/referenceBookService";
import { RefData } from "../type";
import Button from "./Button";

interface ReferenceBookProps {
  clearMode: () => void;
}

function ReferenceBook({ clearMode }: ReferenceBookProps) {
  const [referenceBooksData, setReferenceBooksData] = useState<RefData[]>();
  const [mode, setMode] = useState<RefData | null>(null);
  const getReferenceBooksData = async () => {
    try {
      const res = await referenceBookService.getAllReferenceBooks();
      setReferenceBooksData(res);
    } catch (error) {
      console.log("getReferenceBooksData", error);
    }
  };

  useEffect(() => {
    getReferenceBooksData();
  }, []);

  return (
    <div className="reference-book">
      <Button
        onClick={() => {
          if (!mode) {
            clearMode();
          }
          setMode(null);
        }}
      >
        ← Назад
      </Button>
      {referenceBooksData && !mode && (
        <div className="reference-book__block">
          <h2 className="reference-book__title">Справочники</h2>
          <ul
            className={`reference-book__list ${referenceBooksData.length > 5 && "reference-book__list--two-columns"}`}
          >
            {referenceBooksData.map((ref) => (
              <li key={ref.id} className="reference-book__item" onClick={() => setMode(ref)}>
                {ref.title}
              </li>
            ))}
          </ul>
        </div>
      )}
      {mode && (
        <div className="reference-book__info-block">
          <h3 className="reference-book__info-title">{mode.title}</h3>
          {mode.textImages?.length > 0 && (
            <div className="reference-book__info-images">
              {mode.textImages.map((img, index) => (
                <img
                  key={index}
                  src={typeof img === "string" ? img : img.url}
                  alt={`image-${index}`}
                  className="reference-book__info-image"
                />
              ))}
            </div>
          )}
          <div className="reference-book__info-text">
            {mode.text.split("\n").map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
          {mode.tableImages?.length > 0 && (
            <div className="reference-book__info-tables">
              {mode.tableImages.map((img, index) => (
                <img
                  key={index}
                  src={typeof img === "string" ? img : img.url}
                  alt={`table-${index}`}
                  className="reference-book__info-table"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ReferenceBook;
