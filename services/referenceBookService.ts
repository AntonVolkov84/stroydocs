import axios, { AxiosResponse } from "axios";
const apiUrl: string = import.meta.env.VITE_API_URL;
import { RefDataPayload } from "../type";

export const updateReferenceBook = async (
  id: string | number,
  data: RefDataPayload
): Promise<{ ok: boolean; message: string }> => {
  const payload = { id: id, ...data };
  try {
    await axios.post(`${apiUrl}/referencebook/updateref`, payload, {
      withCredentials: true,
    });
    return {
      ok: true,
      message: "Справочник изменен",
    };
  } catch (error) {
    if (error instanceof Error) {
      console.log("login", error.message);
    } else {
      console.log("login", error);
    }
    return { ok: false, message: "Ошибка при обновлении справочника" };
  }
};
export const createReferenceBook = async (data: RefDataPayload): Promise<{ ok: boolean; message: string }> => {
  try {
    await axios.post(`${apiUrl}/referencebook/createre`, data, {
      withCredentials: true,
    });
    return {
      ok: true,
      message: "Справочник создан",
    };
  } catch (error) {
    if (error instanceof Error) {
      console.log("login", error.message);
    } else {
      console.log("login", error);
    }
    return { ok: false, message: "Ошибка при создании справочника" };
  }
};
export const getAllReferenceBooks = async () => {
  try {
    const res = await axios.get(`${apiUrl}/referencebook/getalldata`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log("getAllNews", error);
  }
};
export const removeReferenceBook = async (id: number | string) => {
  try {
    const res = await axios.delete(`${apiUrl}/referencebook/removeref`, {
      params: { id },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log("getAllNews", error);
  }
};
