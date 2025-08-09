import { useEffect, useState } from "react";
import Button from "./Button";
import * as userService from "../services/userService";
import "./ManageUsers.css";
import { useAppContext } from "../services/AppContext";
import { User } from "../type";

interface ManageUserProps {
  currentUserEmail: string;
}

export default function ManageUsers({ currentUserEmail }: ManageUserProps) {
  const [users, setUsers] = useState<User[]>([]);
  const { confirm } = useAppContext();

  const fetchUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Ошибка при получении пользователей", error);
    }
  };

  const toggleAdmin = async (id: number | string, value: boolean) => {
    try {
      await userService.setAdminStatus(id, !value);
      fetchUsers();
    } catch (error) {
      console.error("Ошибка при обновлении прав администратора", error);
    }
  };
  const toggleUnlim = async (id: number | string, value: boolean) => {
    try {
      await userService.setUnlimStatus(id, !value);
      fetchUsers();
    } catch (error) {
      console.error("Ошибка при обновлении прав администратора", error);
    }
  };

  const deleteUser = async (id: number | string) => {
    const confirmResult = await confirm({
      title: "Удалить пользователя?",
      message: "",
      confirmText: "Да",
      cancelText: "Нет",
    });
    if (!confirmResult) {
      return;
    } else {
      try {
        await userService.deleteUser(id);
        fetchUsers();
      } catch (error) {
        console.error("Ошибка при удалении пользователя", error);
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="Users-manager-container">
      <h2 className="Users-manager-title">Управление пользователями</h2>
      <div className="Users-table-wrapper">
        <table className="Users-table">
          <thead>
            <tr>
              <th>Имя пользователя</th>
              <th>Email</th>
              <th>Подтвержден</th>
              <th>Админ</th>
              <th>Подписка</th>
              <th>Безлимит</th>
              <th className="actions-header">Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.emailconfirmed ? "✅" : "❌"}</td>
                <td>{user.isadmin ? "✅" : "❌"}</td>
                <td>{user.subscribe ? "✅" : "❌"}</td>
                <td>{user.unlimited ? "✅" : "❌"} </td>
                <td className="Users-actions">
                  <div className="actions-buttons">
                    {user.email !== currentUserEmail &&
                      user.email !== "antvolkov84@gmail.com" &&
                      user.email !== "aleks_e@inbox.ru" && (
                        <>
                          <Button onClick={() => toggleUnlim(user.id, user.unlimited ?? false)} className="edit-btn">
                            {user.unlimited ? "Убрать безлим" : "Включить безлим"}
                          </Button>
                          <Button onClick={() => toggleAdmin(user.id, user.isadmin ?? false)} className="edit-btn">
                            {user.isadmin ? "Убрать права" : "Сделать админом"}
                          </Button>
                          <Button onClick={() => deleteUser(user.id)} className="button_btn--red-hover">
                            Удалить
                          </Button>
                        </>
                      )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
