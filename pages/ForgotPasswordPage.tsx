import { useForm } from "react-hook-form";
import { useState } from "react";
import "./ForgotPasswordPage.css";
import * as authServices from "../services/authServices";
import { useNavigate } from "react-router-dom";

interface ForgotPasswordForm {
  email: string;
}

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>();
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      const response = await authServices.forgotPassword(data);
      if (!response) {
        alert("Ошибка при отправке письма");
      } else {
        alert("На почту отправлено письмо для сброса пароля");
        setSubmitted(true);
        navigate("/login");
      }
    } catch (err) {
      setErrorMessage("Ошибка сервера");
    }
  };

  if (submitted) {
    return (
      <div className="container">
        <h2 className="forgotpassword__title">Письмо отправлено!</h2>
        <p className="container__text">
          Если почта найдена, вы получите ссылку для сброса пароля. Страницу можно покинуть.
        </p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="forgotpassword__title">Забыли пароль?</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="forgotpassword__field">
          <label className="forgotpassword__label">Email</label>
          <input
            type="email"
            {...register("email", {
              required: "Введите email",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Некорректный email",
              },
            })}
            className="forgotpassword__input"
          />
          {errors.email && <p className="container__text">{errors.email.message}</p>}
        </div>
        {errorMessage && <p className="container__text">{errorMessage}</p>}
        <button type="submit" disabled={isSubmitting} className="forgotpassword__submit-button">
          {isSubmitting ? "Отправка..." : "Сбросить пароль"}
        </button>
      </form>
    </div>
  );
}
