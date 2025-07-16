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
