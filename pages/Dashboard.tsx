import React from "react";
import * as authServices from "../services/authServices";

interface User {
  id: string;
  email: string;
  username: string;
  emailConfirmed: boolean;
}
interface DashboardProps {
  user: User;
  setUser: (user: User | null) => void;
}

export default function Dashboard({ user, setUser }: DashboardProps) {
  const handleLogOut = (): void => {
    authServices.logout();
    setUser(null);
  };
  return (
    <div>
      <button onClick={() => handleLogOut()}>Выйти</button>
    </div>
  );
}
