import { useForm } from "react-hook-form";
import "./RegisterPage.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as authServices from "../services/authServices";
interface User {
  id: string;
  email: string;
  username: string;
  emailConfirmed: boolean;
  name: string;
  surname: string;
}
interface DataRegister {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  surname: string;
}
interface RegisterPageProps {
  setUser: (user: User | null) => void;
}
declare global {
  interface Window {
    grecaptcha: any;
  }
}
const RECAPTCHA_SITE_KEY = "6Lc8nXErAAAAAHPZDnc6DEPkLQ6iHX_8xv-kN5BA";

export default function RegistrationPage({ setUser }: RegisterPageProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DataRegister>();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const onSubmit = async (data: DataRegister) => {
    if (data.password !== data.confirmPassword) {
      alert("Пароли не совпадают");
      return;
    }
    setLoading(true);
    if (!window.grecaptcha) {
      alert("Ошибка: reCAPTCHA не загружена");
      setLoading(false);
      return;
    }
    try {
      const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: "register" });
      const success = await authServices.register({
        username: data.username,
        email: data.email,
        password: data.password,
        recaptchaToken: token,
        name: data.name,
        surname: data.surname,
      });
      if (success) {
        alert("На почту отправлено письмо! Пожалуйста, подтвердите почту для входа");
        reset();
        navigate("/login");
      } else {
        alert("Ошибка регистрации");
      }
    } catch (error) {
      console.error("Ошибка при регистрации:", error);
    }
    setLoading(false);
  };

  return (
    <form className="register" onSubmit={handleSubmit(onSubmit)}>
      <div className="register__field">
        <label htmlFor="username" className="register__label">
          Никнейм пользователя
        </label>
        <input
          id="username"
          className="register__input"
          type="text"
          placeholder="Введите никнейм пользователя"
          {...register("username", { required: "Имя пользователя обязательно" })}
        />
        {errors.username && <p className="register__error">{errors.username.message}</p>}
      </div>
      <div className="register__field">
        <label htmlFor="name" className="register__label">
          Имя пользователя
        </label>
        <input
          id="name"
          className="register__input"
          type="text"
          placeholder="Введите ваше имя"
          {...register("name", {
            required: "Имя пользователя обязательно",
            minLength: { value: 2, message: "Минимум 2 символа" },
          })}
        />
        {errors.name && <p className="register__error">{errors.name.message}</p>}
      </div>
      <div className="register__field">
        <label htmlFor="surname" className="register__label">
          Фамилия пользователя
        </label>
        <input
          id="surname"
          className="register__input"
          type="text"
          placeholder="Введите вашу фамилию"
          {...register("surname", {
            required: "Фамилия пользователя обязательно",
            minLength: { value: 2, message: "Минимум 2 символа" },
          })}
        />
        {errors.surname && <p className="register__error">{errors.surname.message}</p>}
      </div>

      <div className="register__field">
        <label htmlFor="email" className="register__label">
          Email
        </label>
        <input
          id="email"
          className="register__input"
          type="email"
          placeholder="Введите email"
          {...register("email", {
            required: "Email обязателен",
            pattern: {
              value: /^\S+@\S+$/i,
              message: "Неверный формат email",
            },
          })}
        />
        {errors.email && <p className="register__error">{errors.email.message}</p>}
      </div>

      <div className="register__field">
        <label htmlFor="password" className="register__label">
          Пароль
        </label>
        <input
          id="password"
          className="register__input"
          type="password"
          placeholder="Введите пароль"
          {...register("password", {
            required: "Пароль обязателен",
            minLength: { value: 6, message: "Минимум 6 символов" },
          })}
        />
        {errors.password && <p className="register__error">{errors.password.message}</p>}
      </div>

      <div className="register__field">
        <label htmlFor="confirmPassword" className="register__label">
          Подтвердите пароль
        </label>
        <input
          id="confirmPassword"
          className="register__input"
          type="password"
          placeholder="Подтвердите пароль"
          {...register("confirmPassword", {
            required: "Подтверждение пароля обязательно",
            validate: (value) => value === watch("password") || "Пароли не совпадают",
          })}
        />
        {errors.confirmPassword && <p className="register__error">{errors.confirmPassword.message}</p>}
      </div>

      <button disabled={loading || isSubmitting} className="register__submit-button" type="submit">
        {loading ? "Регистрация..." : "Зарегистрироваться"}
      </button>
      <button className="register__login-button" type="button" onClick={() => navigate("/login")}>
        Уже есть аккаунт? Войти
      </button>
    </form>
  );
}
