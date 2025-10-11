import "./Commercial.css";
import { useState, useEffect } from "react";
import * as commercialOfferService from "../services/commercialOfferService";
import { useAppContext } from "../services/AppContext";
import { useNavigate } from "react-router-dom";
import {
  SavedOfferData,
  SavedOfferDataSecondForm,
  PayloadForCommercialOffer,
  PayloadForCommercialOfferSecondForm,
  PayloadSavedBillOfQuantities,
  SavedBillOfQuantitiesData,
} from "../type";
import Button from "../components/Button";
import * as userService from "../services/userService";

function Commercial() {
  const { user, confirm, prompt, alert, setMode, setExportedRows, setExportData } = useAppContext();
  const [sendingOfferForm, setSendingOfferForm] = useState<boolean>(false);
  const [savedOfferData, setSavedOfferData] = useState<SavedOfferData[] | null>(null);
  const [savedOfferDataSecondForm, setSavedOfferDataSecondForm] = useState<SavedOfferDataSecondForm[] | null>(null);
  const [savedBillOfQuantitiesData, setSavedBillOfQuantitiesData] = useState<SavedBillOfQuantitiesData[] | null>(null);
  const navigate = useNavigate();
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
  const handleDeleteBillOfquantities = async (id: number | string) => {
    const confirmResult = await confirm({
      title: "Удалить сохраненную ведомость объемов работ",
      message: "Вы уверены, она будет стертa из Ваших сохранений?",
      confirmText: "Да",
      cancelText: "Нет",
    });
    if (!confirmResult) return;
    if (confirmResult) {
      await commercialOfferService.deleteSavedBillOfQuantities(id);
      await getSavedBillOfQuantitisData();
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

  function isBillOfQuantities(
    o: SavedOfferData | SavedOfferDataSecondForm | SavedBillOfQuantitiesData
  ): o is SavedBillOfQuantitiesData {
    return !!o && Array.isArray((o as any).rows) && (o as any).rows.length > 0 && "drawing" in (o as any).rows[0];
  }

  function isForm0(o: SavedOfferData | SavedOfferDataSecondForm | SavedBillOfQuantitiesData): o is SavedOfferData {
    return !!o && Array.isArray((o as any).rows) && (o as any).rows.length > 0 && "type" in (o as any).rows[0];
  }

  function isForm1(
    o: SavedOfferData | SavedOfferDataSecondForm | SavedBillOfQuantitiesData
  ): o is SavedOfferDataSecondForm {
    return (
      !!o &&
      Array.isArray((o as any).rows) &&
      (o as any).rows.length > 0 &&
      !("drawing" in (o as any).rows[0]) &&
      !("type" in (o as any).rows[0])
    );
  }

  const sendForm = async (offer: SavedOfferData | SavedOfferDataSecondForm | SavedBillOfQuantitiesData) => {
    let recieverEmail = await prompt({
      title: "Укажите эл почту получателя формы",
      message: "",
      placeholder: "Эл почта получателя",
    });
    setSendingOfferForm(true);
    if (recieverEmail === null) return setSendingOfferForm(false);
    if (!recieverEmail) {
      await alert({
        title: "Вы не ввели почту получателя",
        message: "",
      });
      return setSendingOfferForm(false);
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recieverEmail)) {
      setSendingOfferForm(false);
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
      return setSendingOfferForm(false);
    }
    if (isBillOfQuantities(offer)) {
      const res = await userService.getUserId(recieverEmail);
      if (!res) {
        const payload = {
          email: recieverEmail,
          title: offer.title,
          taxRate: 20,
          rows: offer.rows,
          type: "billofquantities",
          receiver: recieverEmail,
          sender: `${user?.name} ${user?.surname}`,
        };
        await commercialOfferService.savePendingDocument(payload);
        await alert({
          title: "Такой получатель не зарегистрирован",
          message:
            "Возможно, Вы не верно ввели данные, либо получатель еще не зарегистрирован на сайте. В таком случае он получить сообщение на почту с информацией, что ему отправлены документы",
        });
        return setSendingOfferForm(false);
      }
      const payload = {
        title: offer.title,
        userId: res,
        rows: offer.rows,
      };
      commercialOfferService.saveBillOfQuantities(payload as PayloadSavedBillOfQuantities);
      await alert({
        title: "Форма 0 отправлена",
        message: "",
      });
      setSendingOfferForm(false);
    }
    if (isForm0(offer)) {
      const res = await userService.getUserId(recieverEmail);
      if (!res) {
        const payload = {
          email: recieverEmail,
          title: offer.title,
          taxRate: offer.taxrate,
          rows: offer.rows,
          type: "form0",
          receiver: recieverEmail,
          sender: `${user?.name} ${user?.surname}`,
        };
        const response = await commercialOfferService.savePendingDocument(payload);
        await alert({
          title: "Такой получатель не зарегистрирован",
          message:
            "Возможно, Вы не верно ввели данные, либо получатель еще не зарегистрирован на сайте. В таком случае он получить сообщение на почту с информацией, что ему отправлены документы",
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
      if (isForm1(offer)) {
        const res = await userService.getUserId(recieverEmail);
        if (!res) {
          const payload = {
            email: recieverEmail,
            title: offer.title,
            taxRate: offer.taxrate,
            rows: offer.rows,
            type: "form1",
            receiver: recieverEmail,
            sender: `${user?.name} ${user?.surname}`,
          };
          const response = await commercialOfferService.savePendingDocument(payload);
          console.log(response);
          await alert({
            title: "Такой получатель не зарегистрирован",
            message:
              "Возможно, Вы не верно ввели данные, либо получатель еще не зарегистрирован на сайте. В таком случае он получить сообщение на почту с информацией, что ему отправлены документы",
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
    }
  };
  const getSavedBillOfQuantitisData = async () => {
    try {
      if (!user) return;
      const res = await commercialOfferService.getSavedBillOfQuantities(user?.id);
      setSavedBillOfQuantitiesData(res);
    } catch (error) {
      console.log("getSavedBillOfQuantitisData", error);
    }
  };

  useEffect(() => {
    getSavedOfferData();
    getSavedOfferSecondFormData();
    getSavedBillOfQuantitisData();
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
                        setExportData({
                          offerId: offer.id,
                          title: offer.title,
                          taxRate: offer.taxrate,
                          userId: offer.userid,
                          rows: offer.rows,
                        });
                        navigate("/dashboard");
                        setMode({
                          calculators: false,
                          form: true,
                          form1: false,
                          form2: false,
                          referencebook: false,
                          management: false,
                          fileimport: false,
                        });
                        setExportedRows(offer.rows);
                      }}
                    >
                      Просмотреть
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
                        setExportData({
                          offerId: offer.id,
                          title: offer.title,
                          taxRate: offer.taxrate,
                          userId: offer.userid,
                          rows: offer.rows,
                        });
                        navigate("/dashboard");
                        setMode({
                          calculators: false,
                          form: false,
                          form1: true,
                          form2: false,
                          referencebook: false,
                          management: false,
                          fileimport: false,
                        });
                        setExportedRows(offer.rows);
                      }}
                    >
                      Просмотреть
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
        </>
      )}
      {!savedOfferDataSecondForm ||
        (savedOfferDataSecondForm.length === 0 && <p>Нет сохранённых предложений формы 1.</p>)}
      <h2 className="commercial__table-title">Сохранённые ведомости объемов работ</h2>
      {savedBillOfQuantitiesData && savedBillOfQuantitiesData.length > 0 && (
        <div>
          <table className="commercial__table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Дата сохранения</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {savedBillOfQuantitiesData.map((bill) => (
                <tr key={bill.id}>
                  <td>{bill.title}</td>
                  <td>{formatDate(bill.updated_at)}</td>
                  <td className="commercial__actions">
                    <Button
                      onClick={() => {
                        setExportData({
                          offerId: bill.id,
                          title: bill.title,
                          userId: bill.userid,
                          rows: bill.rows,
                        });
                        navigate("/dashboard");
                        setMode({
                          calculators: false,
                          form: false,
                          form1: false,
                          form2: true,
                          referencebook: false,
                          management: false,
                          fileimport: false,
                        });
                        setExportedRows(bill.rows);
                      }}
                    >
                      Просмотреть
                    </Button>
                    <Button
                      disabled={sendingOfferForm}
                      onClick={async () => {
                        sendForm(bill);
                      }}
                    >
                      Отправить форму
                    </Button>
                    <Button className="button_btn--red-hover" onClick={() => handleDeleteBillOfquantities(bill.id)}>
                      Удалить
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!savedBillOfQuantitiesData ||
        (savedBillOfQuantitiesData.length === 0 && <p>Нет сохранённых ведомостей объемов работ</p>)}
    </div>
  );
}

export default Commercial;
