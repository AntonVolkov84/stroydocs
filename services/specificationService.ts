import axios from "axios";
import type { SpecRowData } from "../type";
export type { SpecRowData };

const apiUrl: string = import.meta.env.VITE_API_URL;

export interface SpecificationPayload {
  userId: number | string;
  title: string;
  rows: SpecRowData[];
}

export interface SpecificationUpdatePayload extends SpecificationPayload {
  offerId: number | string;
}

export interface SavedSpecificationData {
  id: number | string;
  userId: number | string;
  title: string;
  rows: SpecRowData[];
  updatedAt?: string;
}

// POST /stroydocs/savespecification — создать
export const saveSpecification = async (payload: SpecificationPayload): Promise<{ ok: boolean; message: string }> => {
  try {
    await axios.post(`${apiUrl}/stroydocs/savespecification`, payload, {
      withCredentials: true,
    });
    return { ok: true, message: "Спецификация сохранена" };
  } catch (error) {
    console.log("saveSpecification", error);
    return { ok: false, message: "Ошибка при сохранении спецификации" };
  }
};

// PUT /stroydocs/updatesavedspecification — изменить
export const updateSpecification = async ({
  offerId,
  ...data
}: SpecificationUpdatePayload): Promise<{ ok: boolean; message: string }> => {
  try {
    await axios.put(
      `${apiUrl}/stroydocs/updatesavedspecification`,
      { specId: offerId, ...data },
      { withCredentials: true },
    );
    return { ok: true, message: "Спецификация изменена" };
  } catch (error) {
    console.log("updateSpecification", error);
    return { ok: false, message: "Ошибка при обновлении спецификации" };
  }
};

// GET /stroydocs/getsavedspecification?userId= — список сохранённых спецификаций пользователя
export const getSavedSpecifications = async (
  userId: number | string,
): Promise<SavedSpecificationData[] | undefined> => {
  try {
    const res = await axios.get(`${apiUrl}/stroydocs/getsavedspecification`, {
      params: { userId },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log("getSavedSpecifications", error);
  }
};

// DELETE /stroydocs/delsavedspecification?specId=&userId= — удалить
export const removeSavedSpecification = async (specId: number | string, userId: number | string) => {
  try {
    const res = await axios.delete(`${apiUrl}/stroydocs/delsavedspecification`, {
      params: { specId, userId },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log("removeSavedSpecification", error);
  }
};
