import React from "react";
export interface Variable {
  name: string;
  description: string;
}

export type ModalState<T> = T | false;

export interface CalculatorInterface {
  id: number;
  title: string;
  formula: string;
  variables: Variable[];
  author_email: string;
  result_unit: string;
  created_at: string;
  updated_at: string;
}

export interface Mode {
  calculators: ModalState<CalculatorInterface>;
  form: boolean;
}
export interface User {
  id: string;
  email: string;
  username: string;
  emailConfirmed: boolean;
  isAdmin?: boolean;
  name: string;
  surname: string;
}
export type InputValues = {
  [key: string]: number;
};

type Calculator = {
  id: number;
  title: string;
  formula: string;
  variables: Variable[];
  result_unit: string;
};
export type Payload = {
  userId: string;
  title: string;
  calculator: Calculator;
  variablesValues: InputValues;
  result: string | number | null;
};
export interface SavedCalculatorData {
  id: string | number;
  userId: string;
  title: string;
  calculator: Calculator;
  input_values: InputValues;
  result: string | number | null;
}
