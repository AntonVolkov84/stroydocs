import axios from "axios";

interface CalculatorForm {
  title: string;
  variables: { name: string; description: string }[];
  formula: string;
  resultUnit: string;
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
