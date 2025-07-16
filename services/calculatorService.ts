import axios from "axios";
import { CalculatorInterface } from "../type";

interface CalculatorForm {
  title: string;
  variables: { name: string; description: string }[];
  formula: string;
  resultUnit: string;
}
interface UpdateCalculatorInput {
  id: number;
  title: string;
  formula: string;
  result_unit: string;
  variables: { name: string; description: string }[];
}

const apiUrl: string = import.meta.env.VITE_API_URL;

export async function createCalculator(data: CalculatorForm): Promise<boolean> {
  try {
    await axios.post(`${apiUrl}/calculators/create`, data, {
      withCredentials: true,
    });
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.log("login", error.message);
    } else {
      console.log("login", error);
    }
    return false;
  }
}
export async function getAllCalculators(): Promise<CalculatorInterface[] | null> {
  try {
    const response = await axios.get(`${apiUrl}/calculators`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка при получении калькуляторов:", error);
    return null;
  }
}
export const deleteCalculator = async (id: number): Promise<{ message: string }> => {
  try {
    const response = await axios.post(
      `${apiUrl}/calculators/delete`,
      { id: id },
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Ошибка при получении калькуляторов:", error);
    return { message: "Ошибка при удалении калькулятора" };
  }
};
export const updateCalculator = async (data: UpdateCalculatorInput): Promise<{ message: string }> => {
  try {
    const response = await axios.post(`${apiUrl}/calculators/update`, data, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка при изменении калькулятора:", error);
    return { message: "Ошибка при изменении калькулятора" };
  }
};
