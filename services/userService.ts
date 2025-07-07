import axios from "axios";

interface User {
  id: number;
  username: string;
  email: string;
  emailconfirmed: boolean;
  isadmin: boolean;
}
const apiUrl: string = import.meta.env.VITE_API_URL;
export const deleteUser = async (id: number): Promise<{ message: string }> => {
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
export const setAdminStatus = async (id: number, value: boolean): Promise<{ message: string }> => {
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
