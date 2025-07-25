import React, { createContext, useContext, useState, ReactNode } from "react";
import { User, ConfirmModalProps } from "../type";

type ConfirmOptions = Omit<ConfirmModalProps, "open" | "onConfirm" | "onCancel">;

interface AppContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
