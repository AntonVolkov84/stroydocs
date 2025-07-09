import { useForm } from "react-hook-form";
import "./LoginPage.css";
import { useNavigate, Link } from "react-router-dom";
import * as authServices from "../services/authServices";
interface User {
  id: string;
  email: string;
  username: string;
  emailConfirmed: boolean;
  isAdmin?: boolean;
  name: string;
  surname: string;
}
interface LoginPageProps {
  setUser: (user: User | null) => void;
}
interface DataLogin {
  username: string;
  password: string;
  email: string;
  recaptchaToken?: string;
  name: string;
  surname: string;
}
export default function LoginPage({ setUser }: LoginPageProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DataLogin>();
  const navigate = useNavigate();
  const onSubmit = async (data: DataLogin): Promise<void> => {
    const loggedIn = await authServices.login(data);
    if (!loggedIn) {
      alert("Неверные данные");
      return;
    }
    const user = await authServices.getMe();
    if (user) {
      setUser(user);
      if (!user.emailConfirmed) {
        alert("Подтвердите Вашу почту");
      } else {
        navigate("/personalpage");
      }
    } else {
      alert("Не удалось получить данные пользователя");
    }
  };
  return (
    <form className="login" onSubmit={handleSubmit(onSubmit)}>
      <div className="login__field">
        <label htmlFor="email" className="login__label">
          Эмаил пользователя
        </label>
        <input
          id="email"
          className="login__input"
          type="email"
          placeholder="Введите эмаил пользователя"
          {...register("email", {
            required: "email обязателен",
          })}
        />
        {errors.email && (
          <p className="login__error" role="alert">
            {errors.email.message}
            <span className="login__error-arrow" />
          </p>
        )}
      </div>
      <div className="login__field">
        <label htmlFor="password" className="login__label">
          Пароль
        </label>
        <input
          id="password"
          className="login__input"
          type="password"
          placeholder="Введите пароль"
          {...register("password", {
            required: "Пароль обязателен",
            minLength: {
              value: 6,
              message: "Пароль должен быть минимум 6 символов",
            },
          })}
        />
        {errors.password && (
          <p className="login__error" role="alert">
            {errors.password.message}
            <span className="login__error-arrow" />
          </p>
        )}
      </div>
      <button className="login__submit-button" type="submit">
        Отправить
      </button>
      <button onClick={() => navigate("/register")} className="login__register-button" type="button">
        Зарегистрироваться
      </button>
      <Link to="/forgotpassword" className="login_forgotpassword">
        Забыли пароль?
      </Link>
    </form>
  );
}
