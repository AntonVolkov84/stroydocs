import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import ManageUsers from "../components/ManageUsers";
import * as userService from "../services/userService";
import { AppContext } from "../services/AppContext";

vi.mock("../services/userService");

describe("ManageUsers", () => {
  test("должен вызывать getAllUsers при маунте", async () => {
    const mockGetAllUsers = vi.fn().mockResolvedValue([]);
    (userService.getAllUsers as unknown as typeof mockGetAllUsers) = mockGetAllUsers;
    const mockConfirm = vi.fn().mockResolvedValue(true);
    render(
      <AppContext.Provider value={{ confirm: mockConfirm }}>
        <ManageUsers currentUserEmail="test@example.com" />
      </AppContext.Provider>
    );

    await waitFor(() => {
      expect(mockGetAllUsers).toHaveBeenCalledTimes(1);
    });
  });
  test("Тест устновки прав админа", async () => {
    const user = {
      id: 1,
      username: "Test User",
      email: "other@example.com",
      emailconfirmed: true,
      isadmin: false,
    };
    const updatedUser = {
      ...user,
      isadmin: true,
    };
    const mockGetAllUsers = vi.fn().mockResolvedValueOnce([user]).mockResolvedValueOnce([updatedUser]);
    const mockSetAdminStatus = vi.fn().mockResolvedValue(true);
    (userService.getAllUsers as unknown as typeof mockGetAllUsers) = mockGetAllUsers;
    (userService.setAdminStatus as unknown as typeof mockSetAdminStatus) = mockSetAdminStatus;
    const mockConfirm = vi.fn().mockResolvedValue(true);
    render(
      <AppContext.Provider value={{ confirm: mockConfirm }}>
        <ManageUsers currentUserEmail="test@example.com" />
      </AppContext.Provider>
    );
    await waitFor(() => {
      expect(screen.getByText("Сделать админом")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Сделать админом"));
    await waitFor(() => {
      expect(mockSetAdminStatus).toHaveBeenCalledTimes(1);
      expect(mockGetAllUsers).toHaveBeenCalledTimes(2);
    });
    await waitFor(() => {
      const row = screen.getByText("other@example.com").closest("tr");
      expect(row).toBeInTheDocument();
      const cells = row?.querySelectorAll("td");
      expect(cells?.[3]?.textContent).toBe("✅");
    });
  });
});
