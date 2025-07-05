import "./ConstructorCalculator.css";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import Button from "./Button";
import { useState, useEffect } from "react";
import Input from "./Input";
import * as calculatorService from "../services/calculatorService";
import { Calculator } from "../components/ManageCalculator";

interface CalculatorForm {
  title: string;
  variables: { name: string; description: string }[];
  formula: string;
  resultUnit: string;
}
interface Props {
  selectedCalculator: Calculator | null;
  onUpdated?: () => void;
}
export default function CalculatorConstructor({ selectedCalculator, onUpdated }: Props) {
  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
    setValue,
  } = useForm<CalculatorForm>({
    defaultValues: {
      title: "",
      variables: [{ name: "" }],
      formula: "",
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variables",
  });
  useEffect(() => {
    if (selectedCalculator) {
      setIsEditing(true);

      reset({
        title: selectedCalculator.title,
        formula: selectedCalculator.formula,
        resultUnit: selectedCalculator.result_unit,
        variables: selectedCalculator.variables as { name: string; description: string }[],
      });
    }
  }, [selectedCalculator, reset]);
  const variables = watch("variables");

  const onSubmit = async (data: CalculatorForm) => {
    try {
      if (isEditing && selectedCalculator) {
        const res = await calculatorService.updateCalculator({
          id: selectedCalculator.id,
          title: data.title,
          formula: data.formula,
          result_unit: data.resultUnit,
          variables: data.variables,
        });
        alert(`${res.message}`);
        reset({
          title: "",
          variables: [{ name: "", description: "" }],
          formula: "",
          resultUnit: "",
        });
      } else {
        await calculatorService.createCalculator(data);
        alert("Калькулятор сохранён!");
      }

      setIsEditing(false);
      reset();
      onUpdated?.();
    } catch (error: any) {
      console.error("Ошибка:", error.message);
      alert(`Ошибка: ${error.message}`);
    }
  };

  const handleInsertVariable = (name: string) => {
    const currentFormula = watch("formula");
    setValue("formula", currentFormula + name);
  };

  return (
    <form className="constructor-container" onSubmit={handleSubmit(onSubmit)}>
      <h2 className="constructor-title">Конструктор калькулятора</h2>

      <div className="form-group">
        <label className="form-label" htmlFor="title">
          Название калькулятора:
        </label>
        <Input
          id="title"
          placeholder="например: Расчёт стоимости доставки"
          {...register("title", {
            required: "Название обязательно",
            minLength: {
              value: 3,
              message: "Минимум 3 символа",
            },
          })}
        />
        {errors.title && <p className="error-message">{errors.title.message}</p>}
      </div>

      <div className="form-group">
        <label className="form-label">Названия переменных:</label>
        {fields.map((field, index) => (
          <div className="form-group-input" key={field.id}>
            <Input
              placeholder={`Переменная ${index + 1}`}
              {...register(`variables.${index}.name`, {
                required: "Введите название переменной",
                minLength: {
                  value: 1,
                  message: "Минимум 1 символ",
                },
                validate: (value) => {
                  const allNames = watch("variables").map((v) => v.name.trim());
                  const duplicates = allNames.filter((name) => name === value.trim());
                  if (duplicates.length > 1) return "Имена переменных должны быть уникальными";
                  return true;
                },
                pattern: {
                  value: /^[a-zA-Zа-яА-ЯёЁ_][a-zA-Zа-яА-ЯёЁ0-9_]*$/,
                  message: "Допустимы латинские и русские буквы, цифры и _",
                },
              })}
            />
            <div className="form-group-input-description">
              <Input placeholder="Описание переменной" {...register(`variables.${index}.description`)} />
            </div>
            <div className="form-group-btnremove">
              <Button
                className="button_btn--red-hover"
                typeBtn="button"
                onClick={() => remove(index)}
                styled={{ marginTop: "8px" }}
              >
                Удалить
              </Button>
            </div>
            {errors.variables?.[index]?.name && (
              <p className="error-message">{errors.variables[index].name?.message}</p>
            )}
          </div>
        ))}
        <Button typeBtn="button" onClick={() => append({ name: "", description: "" })}>
          Добавить переменную
        </Button>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="formula">
          Формула расчёта:
        </label>
        <Controller
          control={control}
          name="formula"
          rules={{
            required: "Формула обязательна",
            validate: (value) => {
              const definedVariables = variables.map((v) => v.name).filter(Boolean);
              const usedVariables = Array.from(new Set(value.match(/[a-zA-Zа-яА-ЯёЁ_][a-zA-Zа-яА-ЯёЁ0-9_]*/g) || []));
              const unknown = usedVariables.filter((v) => !definedVariables.includes(v));
              return unknown.length === 0 || `Неизвестные переменные: ${unknown.join(", ")}`;
            },
          }}
          render={({ field }) => (
            <textarea
              id="formula"
              className="formula-textarea"
              placeholder="например: длина + ширина"
              {...field}
              onChange={(e) => {
                const value = e.target.value;
                const allowed = /^[a-zA-Zа-яА-ЯёЁ0-9_+\-*/()%.,^\s]*$/;

                if (allowed.test(value)) {
                  field.onChange(e);
                }
              }}
            />
          )}
        />
        {errors.formula && <p className="error-message">{errors.formula.message}</p>}
        <div className="variable-buttons">
          {variables
            .filter((v) => v.name.trim() !== "")
            .map((v, idx) => (
              <Button key={idx} typeBtn="button" onClick={() => handleInsertVariable(v.name)}>
                {v.name}
              </Button>
            ))}
        </div>
        <Input
          type="text"
          {...register("resultUnit", { required: "Единица измерения обязательна" })}
          placeholder="Величина ответа, например: м², рулонов, штук"
        />
      </div>

      <div className="form-actions">
        <Button typeBtn="submit">{isEditing ? "Обновить калькулятор" : "Сохранить калькулятор"}</Button>
      </div>
    </form>
  );
}
