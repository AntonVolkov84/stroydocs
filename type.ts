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
  image_url?: string;
  image_public_id?: string;
}

export interface Mode {
  calculators: ModalState<CalculatorInterface>;
  form: boolean;
  form1: boolean;
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
  image_url?: string;
  image_public_id?: string;
};
export type Payload = {
  userId: string;
  title: string;
  calculator: Calculator;
  variablesValues: InputValues;
  imageUri?: string;
  imagePublicId?: string;
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
export interface RowCommercialOffer {
  name: string;
  price: number;
  quantity: number;
  type: "работы" | "материалы" | "механизмы" | "оборудование";
  unit: string;
}
export interface PayloadForCommercialOffer {
  title: string;
  userId: number | string;
  taxRate: number;
  rows: RowCommercialOffer[];
}
export interface PayloadUpdateCommercialOffer extends PayloadForCommercialOffer {
  offerId: number | string;
}
export interface RowCommercialOfferSecondForm {
  machine: string;
  material: string;
  name: string;
  quantity: string;
  salary: string;
  unit: string;
}
export interface PayloadForCommercialOfferSecondForm {
  title: string;
  userId: number | string;
  taxRate: number | string;
  rows: RowCommercialOfferSecondForm[];
}
export interface PayloadUpdateCommercialOfferSecondForm extends PayloadForCommercialOfferSecondForm {
  offerId: number | string;
}
export interface SavedOfferDataSecondForm {
  id: number | string;
  created_at: string;
  title: string;
  userId: number | string;
  taxrate: number | string;
  rows: RowCommercialOfferSecondForm[];
}
export interface SavedOfferData extends PayloadForCommercialOffer {
  id: number | string;
  created_at: string;
}
export interface ReturnOfCloudinaryUpload {
  url: string;
  publicId: string;
}
export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}
export interface AppContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}
export interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}
export interface PromptModalProps {
  open: boolean;
  title?: string;
  message?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}
export interface AlertModalProps {
  open: boolean;
  message: string;
  title?: string;
  confirmText?: string;
  onConfirm: () => void;
}
export type PromptOptions = Omit<PromptModalProps, "open" | "onConfirm" | "onCancel">;
