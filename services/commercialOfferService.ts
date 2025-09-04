import axios, { AxiosResponse } from "axios";

import {
  PayloadForCommercialOffer,
  PayloadUpdateCommercialOffer,
  PayloadForCommercialOfferSecondForm,
  PayloadUpdateCommercialOfferSecondForm,
  PayloadPendingDoc,
  PayloadSavedBillOfQuantities,
} from "../type";

const apiUrl: string = import.meta.env.VITE_API_URL;

export const saveCommercialOffer = async (payload: PayloadForCommercialOffer) => {
  try {
    await axios.post(`${apiUrl}/stroydocs/savecomerc`, payload, {
      withCredentials: true,
    });
  } catch (error) {
    console.log("saveCommercialOffer", error);
  }
};
export const updateCommercialOffer = async (payload: PayloadUpdateCommercialOffer) => {
  try {
    await axios.put(`${apiUrl}/stroydocs/updatesavedcomerc`, payload, {
      withCredentials: true,
    });
  } catch (error) {
    console.log("saveCommercialOffer", error);
  }
};
export const getCommercialOffers = async (id: string | number) => {
  try {
    const response = await axios.get(`${apiUrl}/stroydocs/getsavecomerc`, {
      params: { userId: id },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log("getCommercialOffers", error);
  }
};
export const deleteCommercialOffers = async (id: number | string) => {
  try {
    await axios.delete(`${apiUrl}/stroydocs/delsavedcomerc`, {
      params: { savedComercId: id },
      withCredentials: true,
    });
  } catch (error) {
    console.log("deletegetCommercialOffers", error);
  }
};
export const saveCommercialOfferSecondForm = async (
  payload: PayloadForCommercialOfferSecondForm
): Promise<{ message: string }> => {
  try {
    const res: AxiosResponse<{ message: string }> = await axios.post(
      `${apiUrl}/stroydocs/savecomercsecondform`,
      payload,
      {
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error) {
    console.log("saveCommercialOfferSecondForm", error);
    throw error;
  }
};
export const updateCommercialOfferSecondForm = async (payload: PayloadUpdateCommercialOfferSecondForm) => {
  try {
    await axios.put(`${apiUrl}/stroydocs/updatesavedcomercsecondform`, payload, {
      withCredentials: true,
    });
  } catch (error) {
    console.log("saveCommercialOfferSecondForm", error);
  }
};
export const getCommercialOffersSecondForm = async (id: string | number) => {
  try {
    const response = await axios.get(`${apiUrl}/stroydocs/getsavecomercsecondform`, {
      params: { userId: id },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log("getCommercialOffersSecondForm", error);
  }
};
export const deleteCommercialOffersSecondForm = async (id: number | string) => {
  try {
    await axios.delete(`${apiUrl}/stroydocs/delsavedcomercsecondform`, {
      params: { savedComercId: id },
      withCredentials: true,
    });
  } catch (error) {
    console.log("deletegetCommercialOffersSecondForm", error);
  }
};
export const savePendingDocument = async (payload: PayloadPendingDoc): Promise<{ message: string }> => {
  try {
    const res: AxiosResponse<{ message: string }> = await axios.post(`${apiUrl}/stroydocs/pendingcommercial`, payload, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log("saveCommercialOfferSecondForm", error);
    throw error;
  }
};
export const saveBillOfQuantities = async (payload: PayloadSavedBillOfQuantities): Promise<{ message: string }> => {
  try {
    const res: AxiosResponse<{ message: string }> = await axios.post(`${apiUrl}/stroydocs/savebillbook`, payload, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log("saveBillOfQuantitites", error);
    throw error;
  }
};
export const deleteSavedBillOfQuantities = async (id: number | string) => {
  try {
    await axios.delete(`${apiUrl}/stroydocs/delsavedbillbook`, {
      params: { billId: id },
      withCredentials: true,
    });
  } catch (error) {
    console.log("deleteSavedBillOfQuantities", error);
  }
};
export const updateSavedBillOfQuantities = async (payload: PayloadSavedBillOfQuantities) => {
  try {
    await axios.put(`${apiUrl}/stroydocs/updatesavedbillbook`, payload, {
      withCredentials: true,
    });
  } catch (error) {
    console.log("updateSavedBillOfQuantities", error);
  }
};
export const getSavedBillOfQuantities = async (id: string | number) => {
  try {
    const response = await axios.get(`${apiUrl}/stroydocs/getsavedbillbook`, {
      params: { userId: id },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log("getCommercialOffersSecondForm", error);
  }
};
