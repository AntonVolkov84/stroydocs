import axios from "axios";
import { User } from "../type";

const apiUrl: string = import.meta.env.VITE_API_URL;
export const deleteUser = async (id: number | string): Promise<{ message: string }> => {
  try {
    const response = await axios.post(
      `${apiUrl}/users/remove`,
      { id: id },
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Ошибка при получении пользователей:", error);
    return { message: "Ошибка при удалении пользователя" };
  }
};
export const setAdminStatus = async (id: number | string, value: boolean): Promise<{ message: string }> => {
  try {
    const response = await axios.post(
      `${apiUrl}/users/toggleadmin`,
      { id: id, value: value },
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Ошибка при изменении прав пользователя:", error);
    return { message: "Ошибка при изменении прав пользователя:" };
  }
};
export const setUnlimStatus = async (id: number | string, value: boolean): Promise<{ message: string }> => {
  try {
    const response = await axios.post(
      `${apiUrl}/users/toggleunlim`,
      { id: id, value: value },
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Ошибка при изменении биллинга пользователя:", error);
    return { message: "Ошибка при изменении биллинга пользователя:" };
  }
};
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await axios.get(`${apiUrl}/users`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка при получении пользователей:", error);
    return [];
  }
};
export const getUserId = async (email: string): Promise<string | number> => {
  try {
    const response = await axios.post(
      `${apiUrl}/users/getuserid`,
      { email },
      {
        withCredentials: true,
      }
    );
    return response.data.id;
  } catch (error) {
    console.error("Ошибка при получении ID пользователя:", error);
    return "";
  }
};
