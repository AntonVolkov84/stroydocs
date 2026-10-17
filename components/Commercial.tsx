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
import * as specificationService from "../services/specificationService";
import type { SavedSpecificationData } from "../services/specificationService";
import Button from "../components/Button";
import * as userService from "../services/userService";
import axios from "axios";
const apiUrl: string = import.meta.env.VITE_API_URL;
function Commercial() {
  const { user, confirm, prompt, alert } = useAppContext();
  const [sendingOfferForm, setSendingOfferForm] = useState<boolean>(false);
  const [savedOfferData, setSavedOfferData] = useState<SavedOfferData[] | null>(null);
  const [savedOfferDataSecondForm, setSavedOfferDataSecondForm] = useState<SavedOfferDataSecondForm[] | null>(null);
  const [savedBillOfQuantitiesData, setSavedBillOfQuantitiesData] = useState<SavedBillOfQuantitiesData[] | null>(null);
  const [savedSpecifications, setSavedSpecifications] = useState<SavedSpecificationData[] | null>(null);
  const navigate = useNavigate();
  const getSavedOfferData = async () => {
    if (!user) return;
    const id = user.id;
    const data = await commercialOfferService.getCommercialOffers(id);
    setSavedOfferData(data);
  };
  const getSavedSpecificationsData = async () => {
    if (!user) return;
    const data = await specificationService.getSavedSpecifications(user.id);
    setSavedSpecifications(data ?? []);
  };

  const handleDeleteSpecification = async (id: number | string) => {
    if (!user) return;
    const confirmResult = await confirm({
      title: "Удалить сохранённую спецификацию",
      message: "Вы уверены, она будет стерта из Ваших сохранений?",
      confirmText: "Да",
      cancelText: "Нет",
    });
    if (!confirmResult) return;
    await specificationService.removeSavedSpecification(id, user.id);
    await getSavedSpecificationsData();
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
    o: SavedOfferData | SavedOfferDataSecondForm | SavedBillOfQuantitiesData,
  ): o is SavedBillOfQuantitiesData {
    return !!o && Array.isArray((o as any).rows) && (o as any).rows.length > 0 && "drawing" in (o as any).rows[0];
  }

  function isForm0(o: SavedOfferData | SavedOfferDataSecondForm | SavedBillOfQuantitiesData): o is SavedOfferData {
    return !!o && Array.isArray((o as any).rows) && (o as any).rows.length > 0 && "type" in (o as any).rows[0];
  }

  function isForm1(
    o: SavedOfferData | SavedOfferDataSecondForm | SavedBillOfQuantitiesData,
  ): o is SavedOfferDataSecondForm {
    return (
      !!o &&
      Array.isArray((o as any).rows) &&
      (o as any).rows.length > 0 &&
      !("drawing" in (o as any).rows[0]) &&
      !("type" in (o as any).rows[0])
    );
  }
  const togglePublicStatusCommercialOffer = async (id: number) => {
    try {
      const res = await axios.put(`${apiUrl}/stroydocs/toggleprivatcomerc`, { id }, { withCredentials: true });

      if (res.status === 200 && res.data && typeof res.data.isPublic === "boolean") {
        const newStatus = res.data.isPublic;

        setSavedOfferData((prevData) =>
          prevData
            ? prevData.map((offer) =>
                offer.id === id ? { ...offer, isPublic: newStatus, ispublic: newStatus } : offer,
              )
            : [],
        );
      }
    } catch (error) {
      console.error("togglePublicStatusCommercialOffer error:", error);
    }
  };

  const togglePublicStatusCommercialOfferSecondForm = async (id: number) => {
    try {
      const res = await axios.put(
        `${apiUrl}/stroydocs/toggleprivatcomercsecondform`,
        { id },
        { withCredentials: true },
      );

      if (res.status === 200 && res.data && typeof res.data.isPublic === "boolean") {
        const newStatus = res.data.isPublic;

        setSavedOfferDataSecondForm((prevData) =>
          prevData
            ? prevData.map((offer) =>
                offer.id === id ? { ...offer, isPublic: newStatus, ispublic: newStatus } : offer,
              )
            : [],
        );
      }
    } catch (error) {
      console.error("togglePublicStatusCommercialOfferSecondForm error:", error);
    }
  };

  const togglePublicStatusBillOfQuantities = async (id: number) => {
    try {
      const res = await axios.put(
        `${apiUrl}/stroydocs/toggleprivatbillofquantities`,
        { id },
        { withCredentials: true },
      );

      if (res.status === 200 && res.data && typeof res.data.isPublic === "boolean") {
        const newStatus = res.data.isPublic;

        setSavedBillOfQuantitiesData((prevData) =>
          prevData
            ? prevData.map((item) => (item.id === id ? { ...item, isPublic: newStatus, ispublic: newStatus } : item))
            : [],
        );
      }
    } catch (error) {
      console.error("togglePublicStatusBillOfQuantities error:", error);
    }
  };

  function isSpecification(
    o: SavedOfferData | SavedOfferDataSecondForm | SavedBillOfQuantitiesData | SavedSpecificationData,
  ): o is SavedSpecificationData {
    return !!o && Array.isArray((o as any).rows) && (o as any).rows.length > 0 && "manufacturer" in (o as any).rows[0];
  }

  const sendForm = async (
    offer: SavedOfferData | SavedOfferDataSecondForm | SavedBillOfQuantitiesData | SavedSpecificationData,
  ) => {
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
    if (isSpecification(offer)) {
      const res = await userService.getUserId(recieverEmail);
      if (!res) {
        await commercialOfferService.savePendingDocument({
          email: recieverEmail,
          title: offer.title,
          taxRate: 20, // у спецификации налога нет, поле обязательно на беке
          rows: offer.rows,
          type: "specification",
          receiver: recieverEmail,
          sender: `${user?.name} ${user?.surname}`,
        });
        await alert({
          title: "Такой получатель не зарегистрирован",
          message:
            "Возможно, Вы не верно ввели данные, либо получатель еще не зарегистрирован на сайте. В таком случае он получить сообщение на почту с информацией, что ему отправлены документы",
        });
        return setSendingOfferForm(false);
      }
      const result = await specificationService.saveSpecification({
        title: offer.title,
        userId: res,
        rows: offer.rows,
      });
      await alert({
        title: result.ok ? "Спецификация отправлена" : result.message,
        message: "",
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
      console.log(res);
    } catch (error) {
      console.log("getSavedBillOfQuantitisData", error);
    }
  };

  useEffect(() => {
    getSavedOfferData();
    getSavedOfferSecondFormData();
    getSavedBillOfQuantitisData();
    getSavedSpecificationsData();
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
                        navigate("/forms/commercial-offer-0", {
                          state: {
                            rows: offer.rows,
                            title: offer.title,
                            offerId: offer.id,
                            userId: offer.userid,
                            taxRate: offer.taxrate,
                            showBackButton: true,
                          },
                        });
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
                    <Button
                      className={offer.isPublic || offer.ispublic ? "button_btn--red-hover" : ""}
                      onClick={async () => await togglePublicStatusCommercialOffer(Number(offer.id))}
                    >
                      {offer.isPublic || offer.ispublic ? "Убрать из доступа" : "Сделать публичной"}
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
                        navigate("/forms/commercial-offer-1", {
                          state: {
                            rows: offer.rows,
                            title: offer.title,
                            offerId: offer.id,
                            userId: offer.userid,
                            taxRate: offer.taxrate,
                            showBackButton: true,
                          },
                        });
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
                    <Button
                      className={offer.isPublic || offer.ispublic ? "button_btn--red-hover" : ""}
                      onClick={async () => await togglePublicStatusCommercialOfferSecondForm(Number(offer.id))}
                    >
                      {offer.isPublic || offer.ispublic ? "Убрать из доступа" : "Сделать публичной"}
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
                        navigate("/forms/bill-of-quantities", {
                          state: {
                            rows: bill.rows,
                            title: bill.title,
                            offerId: bill.id,
                            userId: bill.userid,
                            showBackButton: true,
                          },
                        });
                      }}
                    >
                      Открыть ведомость
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
                    <Button
                      className={bill.ispublic ? "button_btn--red-hover" : ""}
                      onClick={async () => await togglePublicStatusBillOfQuantities(Number(bill.id))}
                    >
                      {bill.ispublic ? "Убрать из доступа" : "Сделать публичной"}
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
      <h2 className="commercial__table-title">Сохранённые спецификации</h2>
      {savedSpecifications && savedSpecifications.length > 0 && (
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
              {savedSpecifications.map((spec) => (
                <tr key={spec.id}>
                  <td>{spec.title}</td>
                  <td>{spec.updatedAt ? formatDate(spec.updatedAt) : "—"}</td>
                  <td className="commercial__actions">
                    <Button
                      onClick={() => {
                        navigate("/forms/specificationformpage", {
                          state: {
                            rows: spec.rows,
                            title: spec.title,
                            offerId: spec.id,
                            userId: spec.userId,
                            showBackButton: true,
                          },
                        });
                      }}
                    >
                      Открыть спецификацию
                    </Button>
                    <Button disabled={sendingOfferForm} onClick={() => sendForm(spec)}>
                      Отправить форму
                    </Button>
                    <Button className="button_btn--red-hover" onClick={() => handleDeleteSpecification(spec.id)}>
                      Удалить
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {savedSpecifications && savedSpecifications.length === 0 && <p>Нет сохранённых спецификаций.</p>}
    </div>
  );
}

export default Commercial;
