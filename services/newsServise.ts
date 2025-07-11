import axios from "axios";
const apiUrl: string = import.meta.env.VITE_API_URL;
interface NewsData {
  title: string;
  text: string;
  imageUrl: string;
  imagePublicId: string;
}
interface ChangeArticle {
  title: string;
  text: string;
  imageUrl?: string;
  imagePublicId?: string;
}
export const createNew = async (data: NewsData): Promise<{ ok: boolean; message: string }> => {
  try {
    await axios.post(`${apiUrl}/news/create`, data, {
      withCredentials: true,
    });
    return {
      ok: true,
      message: "Новость создана",
    };
  } catch (error) {
    if (error instanceof Error) {
      console.log("login", error.message);
    } else {
      console.log("login", error);
    }
    return { ok: false, message: "Ошибка при создании новости" };
  }
};
export const getAllNews = async () => {
  try {
    const res = await axios.get(`${apiUrl}/news/getallnews`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log("getAllNews", error);
  }
};
export const deleteNew = async (id: number) => {
  try {
    const res = await axios.delete(`${apiUrl}/news/delete`, {
      params: { id },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log("deleteNew", error);
  }
};
export const updateNew = async (id: number, data: ChangeArticle) => {
  try {
    const response = await axios.put(`${apiUrl}/news/changenew/${id}`, data, {
      withCredentials: true,
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Ошибка при обновлении новости:", error);
    return { ok: false, message: "Ошибка обновления" };
  }
};
