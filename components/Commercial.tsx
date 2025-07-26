import "./Commercial.css";
import { useState, useEffect } from "react";
import * as commercialOfferService from "../services/commercialOfferService";
import { useAppContext } from "../services/AppContext";
import { SavedOfferData, SavedOfferDataSecondForm } from "../type";
import Button from "../components/Button";
import CommercialOfferForm from "../components/CommercialOfferForm";
import SecondCommercialOfferForm from "./SecondCommercialOfferForm";

function Commercial() {
  const { user, confirm } = useAppContext();
  const [selectedOffer, setSelectedOffer] = useState<SavedOfferData | null>(null);
  const [selectedOfferSecondForm, setSelectedOfferSecondForm] = useState<SavedOfferDataSecondForm | null>(null);
  const [savedOfferData, setSavedOfferData] = useState<SavedOfferData[] | null>(null);
  const [savedOfferDataSecondForm, setSavedOfferDataSecondForm] = useState<SavedOfferDataSecondForm[] | null>(null);
  const getSavedOfferData = async () => {
    if (!user) return;
    const id = user.id;
    const data = await commercialOfferService.getCommercialOffers(id);
    setSavedOfferData(data);
  };
  const getSavedOfferSecondFormData = async () => {
    if (!user) return;
    const id = user.id;
    const data = await commercialOfferService.getCommercialOffersSecondForm(id);
    setSavedOfferDataSecondForm(data);
  };

  const handleDelete = async (id: number | string) => {
    const confirmResult = await confirm({
      title: "Удалить сохраненное коммерческое предложение",
      message: "Вы уверены, оно будет стерто из Ваших сохранений?",
      confirmText: "Да",
      cancelText: "Нет",
    });
    if (!confirmResult) return;
    if (confirmResult) {
      await commercialOfferService.deleteCommercialOffers(id);
      await getSavedOfferData();
    }
  };
  const handleDeleteSecondForm = async (id: number | string) => {
    const confirmResult = await confirm({
      title: "Удалить сохраненное коммерческое предложение",
      message: "Вы уверены, оно будет стерто из Ваших сохранений?",
      confirmText: "Да",
      cancelText: "Нет",
    });
    if (!confirmResult) return;
    if (confirmResult) {
      await commercialOfferService.deleteCommercialOffersSecondForm(id);
      await getSavedOfferSecondFormData();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
      .format(date)
      .replace(",", " в");
  };

  useEffect(() => {
    getSavedOfferData();
    getSavedOfferSecondFormData();
  }, []);

  return (
    <div className="commercial__container">
      <h2>Сохранённые коммерческие предложения формы 0</h2>
      {savedOfferData && savedOfferData.length > 0 && (
        <>
          <table className="commercial__table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Дата сохранения</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {savedOfferData.map((offer) => (
                <tr key={offer.id}>
                  <td>{offer.title}</td>
                  <td>{formatDate(offer.created_at)}</td>
                  <td className="commercial__actions">
                    <Button onClick={() => setSelectedOffer(selectedOffer?.id === offer.id ? null : offer)}>
                      {selectedOffer?.id === offer.id ? "Скрыть" : "Просмотреть"}
                    </Button>
                    <Button className="button_btn--red-hover" onClick={() => handleDelete(offer.id)}>
                      Удалить
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {selectedOffer && (
            <div className="commercial-form0">
              <CommercialOfferForm
                showBackButton={!selectedOffer}
                initialRows={selectedOffer.rows}
                initialTaxRate={selectedOffer.taxRate}
                initialTitle={selectedOffer.title}
                initialOfferId={selectedOffer.id}
                onUpdateSuccess={getSavedOfferData}
                setSelectedOffer={setSelectedOffer}
              />
            </div>
          )}
        </>
      )}
      {!savedOfferData || (savedOfferData.length === 0 && <p>Нет сохранённых предложений формы 0.</p>)}
      <h2>Сохранённые коммерческие предложения формы 1</h2>
      {savedOfferDataSecondForm && savedOfferDataSecondForm.length > 0 && (
        <>
          <table className="commercial__table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Дата сохранения</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {savedOfferDataSecondForm.map((offer) => (
                <tr key={offer.id}>
                  <td>{offer.title}</td>
                  <td>{formatDate(offer.created_at)}</td>
                  <td className="commercial__actions">
                    <Button
                      onClick={() =>
                        setSelectedOfferSecondForm(selectedOfferSecondForm?.id === offer.id ? null : offer)
                      }
                    >
                      {selectedOfferSecondForm?.id === offer.id ? "Скрыть" : "Просмотреть"}
                    </Button>
                    <Button className="button_btn--red-hover" onClick={() => handleDeleteSecondForm(offer.id)}>
                      Удалить
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {selectedOfferSecondForm && (
            <div className="commercial-form1">
              <SecondCommercialOfferForm
                showBackButton={!setSelectedOfferSecondForm}
                initialRows={selectedOfferSecondForm.rows}
                initialTaxRate={selectedOfferSecondForm.taxrate}
                initialTitle={selectedOfferSecondForm.title}
                initialOfferId={selectedOfferSecondForm.id}
                onUpdateSuccess={getSavedOfferSecondFormData}
                setSelectedOffer={setSelectedOfferSecondForm}
              />
            </div>
          )}
        </>
      )}
      {!savedOfferDataSecondForm ||
        (savedOfferDataSecondForm.length === 0 && <p>Нет сохранённых предложений формы 1.</p>)}
    </div>
  );
}

export default Commercial;
