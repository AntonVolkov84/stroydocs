import "./Commercial.css";
import { useState, useEffect } from "react";
import * as commercialOfferService from "../services/commercialOfferService";
import { useAppContext } from "../services/AppContext";
import {
  SavedOfferData,
  SavedOfferDataSecondForm,
  PayloadForCommercialOffer,
  PayloadForCommercialOfferSecondForm,
} from "../type";
import Button from "../components/Button";
import CommercialOfferForm from "../components/CommercialOfferForm";
import SecondCommercialOfferForm from "./SecondCommercialOfferForm";
import * as userService from "../services/userService";

function Commercial() {
  const { user, confirm, prompt, alert } = useAppContext();
  const [selectedOffer, setSelectedOffer] = useState<SavedOfferData | null>(null);
  const [selectedOfferSecondForm, setSelectedOfferSecondForm] = useState<SavedOfferDataSecondForm | null>(null);
  const [sendingOfferForm, setSendingOfferForm] = useState<boolean>(false);
  const [savedOfferData, setSavedOfferData] = useState<SavedOfferData[] | null>(null);
  const [savedOfferDataSecondForm, setSavedOfferDataSecondForm] = useState<SavedOfferDataSecondForm[] | null>(null);

  const getSavedOfferData = async () => {
    if (!user) return;
    const id = user.id;
    const data = await commercialOfferService.getCommercialOffers(id);
    setSavedOfferData(data);
    console.log(data);
  };
  const getSavedOfferSecondFormData = async () => {
    if (!user) return;
    const id = user.id;
    const data = await commercialOfferService.getCommercialOffersSecondForm(id);
    setSavedOfferDataSecondForm(data);
    console.log(data);
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

  const sendForm = async (offer: SavedOfferData | SavedOfferDataSecondForm) => {
    let recieverEmail = await prompt({
      title: "Укажите эл почту получателя формы",
      message: "",
      placeholder: "Эл почта получателя",
    });
    setSendingOfferForm(true);
    if (recieverEmail === null) return;
    if (!recieverEmail) {
      await alert({
        title: "Вы не ввели почту получателя",
        message: "",
      });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recieverEmail)) {
      return await alert({
        title: "Введите корректный адрес электронной почты!",
        message: "",
      });
    }
    const currentUserEmail = user?.email;
    if (currentUserEmail === recieverEmail) {
      await alert({
        title: "Нет смысла отправлять себе!",
        message: "У тебя уже есть эта форма",
      });
      return;
    }
    if ("type" in offer.rows[0]) {
      const res = await userService.getUserId(recieverEmail);
      if (!res) {
        await alert({
          title: "Получатель не найден",
          message: "Проверьте почту",
        });
        return setSendingOfferForm(false);
      }
      const payload = {
        title: offer.title,
        userId: res,
        taxRate: offer.taxrate,
        rows: offer.rows,
      };
      commercialOfferService.saveCommercialOffer(payload as PayloadForCommercialOffer);
      await alert({
        title: "Форма 0 отправлена",
        message: "",
      });
      setSendingOfferForm(false);
    } else {
      const res = await userService.getUserId(recieverEmail);
      if (!res) {
        await alert({
          title: "Получатель не найден",
          message: "Проверьте почту",
        });
        return setSendingOfferForm(false);
      }
      const payload = {
        title: offer.title,
        userId: res,
        taxRate: offer.taxrate,
        rows: offer.rows,
      };
      commercialOfferService.saveCommercialOfferSecondForm(payload as PayloadForCommercialOfferSecondForm);
      await alert({
        title: "Форма 1 отправлена",
        message: "",
      });
      setSendingOfferForm(false);
    }
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
                    <Button
                      onClick={() => {
                        setSelectedOfferSecondForm(null);
                        setSelectedOffer((prev) => (prev?.id === offer.id ? null : offer));
                      }}
                    >
                      {selectedOffer?.id === offer.id ? "Скрыть" : "Просмотреть"}
                    </Button>
                    <Button
                      disabled={sendingOfferForm}
                      onClick={() => {
                        sendForm(offer);
                      }}
                    >
                      Отправить форму
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
                key={selectedOffer?.id}
                showBackButton={!selectedOffer}
                initialRows={selectedOffer.rows}
                initialTaxRate={selectedOffer.taxrate}
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
      <h2 className="commercial__table-title">Сохранённые коммерческие предложения формы 1</h2>
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
                      onClick={() => {
                        setSelectedOffer(null);
                        setSelectedOfferSecondForm((prev) => (prev?.id === offer.id ? null : offer));
                      }}
                    >
                      {selectedOfferSecondForm?.id === offer.id ? "Скрыть" : "Просмотреть"}
                    </Button>
                    <Button
                      disabled={sendingOfferForm}
                      onClick={async () => {
                        sendForm(offer);
                      }}
                    >
                      Отправить форму
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
                key={selectedOfferSecondForm?.id}
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
