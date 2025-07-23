import "./ConstructorCalculator.css";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import Button from "./Button";
import { useState, useEffect } from "react";
import Input from "./Input";
import * as calculatorService from "../services/calculatorService";
import { Calculator } from "../components/ManageCalculator";
import { uploadImageToCloudinary, delFromStorage } from "../services/cloudinaryService";
import { ReturnOfCloudinaryUpload } from "../type";

interface CalculatorForm {
  title: string;
  variables: { name: string; description: string }[];
  formula: string;
  resultUnit: string;
  imageUri?: string;
  imagePublicId?: string;
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
    getValues,
  } = useForm<CalculatorForm>({
    defaultValues: {
      title: "",
      variables: [{ name: "" }],
      formula: "",
    },
  });
  const [imagePath, setImagePath] = useState<ReturnOfCloudinaryUpload | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOldImageDeleted, setIsOldImageDeleted] = useState(false);
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variables",
  });

  useEffect(() => {
    if (selectedCalculator) {
      setIsEditing(true);
      setIsOldImageDeleted(false);
      reset({
        title: selectedCalculator.title,
        formula: selectedCalculator.formula,
        resultUnit: selectedCalculator.result_unit,
        variables: selectedCalculator.variables as { name: string; description: string }[],
      });
    }
  }, [selectedCalculator, reset]);
  const variables = watch("variables");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setUploadError("Размер изображения не должен превышать 1 МБ");
      return;
    }
    try {
      setUploadError(null);
      const uploadedPath = await uploadImageToCloudinary(file);
      setImagePath(uploadedPath);
    } catch (error) {
      setUploadError("Ошибка при загрузке изображения");
      console.error(error);
    }
  };

  const handleRemoveImage = async () => {
    try {
      if (imagePath) {
        await delFromStorage(imagePath.publicId);
        setImagePath(null);
      } else if (selectedCalculator?.image_public_id) {
        await delFromStorage(selectedCalculator.image_public_id);
        setIsOldImageDeleted(true);
      }
    } catch (error) {
      console.error("Ошибка при удалении изображения:", error);
    }
  };

  const onSubmit = async (data: CalculatorForm) => {
    const fieldsToCheck = [
      data.title,
      data.formula,
      data.resultUnit,
      ...data.variables.map((v) => v.name),
      ...data.variables.map((v) => v.description || ""),
    ];
    const hasHTML = fieldsToCheck.some(containsHTML);
    if (hasHTML) {
      alert("Ввод HTML или потенциально опасного кода запрещён.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (isEditing && selectedCalculator) {
        const res = await calculatorService.updateCalculator({
          id: selectedCalculator.id,
          title: data.title,
          formula: data.formula,
          result_unit: data.resultUnit,
          variables: data.variables,
          imageUri: imagePath?.url || "",
          imagePublicId: imagePath?.publicId || "",
        });
        alert(`${res.message}`);
        reset({
          title: "",
          variables: [{ name: "", description: "" }],
          formula: "",
          resultUnit: "",
        });
      } else {
        await calculatorService.createCalculator({
          ...data,
          imageUri: imagePath?.url || "",
          imagePublicId: imagePath?.publicId || "",
        });
        alert("Калькулятор сохранён!");
      }

      setIsEditing(false);
      reset();
      onUpdated?.();
    } catch (error: any) {
      console.error("Ошибка:", error.message);
      alert(`Ошибка: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInsertVariable = (name: string) => {
    const currentFormula = watch("formula");
    setValue("formula", currentFormula + name);
  };
  const containsHTML = (str: string) => /<\/?[a-z][\s\S]*>/i.test(str);
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
                  const allNames = getValues("variables").map((v) => v.name.trim());
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
      <div className="form-group">
        <label className="form-label">Изображение (до 1 МБ):</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {uploadError && <p className="error-message">{uploadError}</p>}

        {(imagePath || (selectedCalculator?.image_url && !isOldImageDeleted)) && (
          <div className="image-preview">
            <img
              src={imagePath?.url || selectedCalculator?.image_url}
              alt="Предпросмотр"
              style={{ maxWidth: "200px", marginTop: "10px" }}
            />
            <Button typeBtn="button" className="button_btn--red-hover" onClick={handleRemoveImage}>
              Удалить изображение
            </Button>
          </div>
        )}
      </div>
      <div className="form-actions">
        <Button disabled={isSubmitting} typeBtn="submit">
          {isSubmitting ? "Отправка..." : isEditing ? "Обновить калькулятор" : "Сохранить калькулятор"}
        </Button>
      </div>
    </form>
  );
}
