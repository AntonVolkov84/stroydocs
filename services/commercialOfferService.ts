import axios from "axios";

import { PayloadForCommercialOffer, PayloadUpdateCommercialOffer } from "../type";

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
