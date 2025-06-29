import { useEffect, useState } from "react";
import "./ConfirmEmail.css";

export default function ConfirmEmail() {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      return;
    }

    fetch("https://stroymonitoring.info/stroydocs/confirmmail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка подтверждения");
        return res.json();
      })
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, []);

  if (status === "loading")
    return (
      <div className="confirmemail">
        <p className="confirmemail_text">Подтверждение почты...</p>
      </div>
    );
  if (status === "success")
    return (
      <div className="confirmemail">
        <p className="confirmemail_text">Почта успешно подтверждена! Можно покинуть страницу!</p>
      </div>
    );
  if (status === "error")
    return (
      <div className="confirmemail">
        <p className="confirmemail_text">Ошибка при подтверждении почты.</p>
      </div>
    );
}
