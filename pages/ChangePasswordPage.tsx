import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useState } from "react";
import * as authServices from "../services/authServices";
import "./ChangePasswordPage.css";

interface ChangePasswordForm {
  password: string;
  confirmPassword: string;
}
interface User {
  id: string;
  email: string;
  username: string;
  emailConfirmed: boolean;
}
interface ChangePasswordPageProps {
  user: User | null;
}

export default function ChangePasswordPage({ user }: ChangePasswordPageProps) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordForm>();
  const isUserLoggedIn = !!user;
  const onSubmit = async (data: ChangePasswordForm) => {
    try {
      if (!token && !isUserLoggedIn) {
        setErrorMessage("Недействительная ссылка или требуется авторизация.");
        return;
      }
      const payload = token ? { token, password: data.password } : { password: data.password };
      if (!payload) {
        setErrorMessage("Недействительная ссылка или требуется авторизация.");
        return;
      }
      const response = await authServices.changePassword(payload);
      if (response) {
        setSubmitted(true);
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setErrorMessage("Ошибка при смене пароля");
      }
    } catch (err) {
      console.log(err);
      setErrorMessage("Ошибка сервера");
    }
  };

  if (submitted) {
    return (
      <div className="container">
        <h2 className="changepassword__title">Пароль изменён!</h2>
        <p className="container__text">Через пару секунд вы будете перенаправлены на страницу входа.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="changepassword__title">Смена пароля</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="changepassword__field">
          <label className="changepassword__label">Новый пароль</label>
          <input
            type="password"
            {...register("password", {
              required: "Введите новый пароль",
              minLength: {
                value: 6,
                message: "Минимум 6 символов",
              },
            })}
            className="changepassword__input"
          />
          {errors.password && <p className="container__text">{errors.password.message}</p>}
        </div>

        <div className="changepassword__field">
          <label className="changepassword__label">Повторите пароль</label>
          <input
            type="password"
            {...register("confirmPassword", {
              required: "Повторите пароль",
              validate: (value) => value === watch("password") || "Пароли не совпадают",
            })}
            className="changepassword__input"
          />
          {errors.confirmPassword && <p className="container__text">{errors.confirmPassword.message}</p>}
        </div>

        {errorMessage && <p className="container__text">{errorMessage}</p>}

        <button type="submit" disabled={isSubmitting} className="changepassword__submit-button">
          {isSubmitting ? "Сохранение..." : "Сменить пароль"}
        </button>
      </form>
    </div>
  );
}
