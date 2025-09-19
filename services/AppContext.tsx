import React, { createContext, useContext, useState, useEffect, Dispatch, SetStateAction } from "react";
import axios from "axios";
import Confirmation from "../components/Confirmation";
import PromptModal from "../components/PromptModal";
import AlertModal from "../components/AlertModal";
import {
  User,
  ConfirmModalProps,
  PromptModalProps,
  AlertModalProps,
  Mode,
  RowData,
  RowsBillOfQuantities,
} from "../type";

type ConfirmOptions = Omit<ConfirmModalProps, "open" | "onConfirm" | "onCancel">;
type PromptOptions = Omit<PromptModalProps, "open" | "onConfirm" | "onCancel">;
type AlertOptions = Omit<AlertModalProps, "open" | "onConfirm">;

interface AppContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  prompt: (options: PromptOptions) => Promise<string | null>;
  loading: boolean;
  alert: (options: AlertOptions) => Promise<void>;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
  mode: Mode;
  exportedRows: RowData[] | RowsBillOfQuantities[] | null;
  setExportedRows: React.Dispatch<React.SetStateAction<RowData[] | RowsBillOfQuantities[] | null>>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions | null>(null);
  const [promptOptions, setPromptOptions] = useState<PromptOptions | null>(null);
  const [confirmResolver, setConfirmResolver] = useState<(value: boolean) => void>(() => () => {});
  const [promptResolver, setPromptResolver] = useState<(value: string | null) => void>(() => () => {});
  const [alertOptions, setAlertOptions] = useState<AlertOptions | null>(null);
  const [alertResolver, setAlertResolver] = useState<() => void>(() => () => {});
  const [exportedRows, setExportedRows] = useState<RowData[] | RowsBillOfQuantities[] | null>(null);
  const [mode, setMode] = useState<Mode>({
    calculators: false,
    form: false,
    form1: false,
    form2: false,
    referencebook: false,
    management: false,
    fileimport: false,
  });

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios
      .post<User>(`${apiUrl}/stroydocs/me`, {}, { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);
  const alert = (options: AlertOptions) => {
    setAlertOptions(options);
    return new Promise<void>((resolve) => {
      setAlertResolver(() => resolve);
    });
  };
  const handleAlertConfirm = () => {
    setAlertOptions(null);
    alertResolver();
  };
  const confirm = (options: ConfirmOptions) => {
    setConfirmOptions(options);
    return new Promise<boolean>((resolve) => {
      setConfirmResolver(() => resolve);
    });
  };

  const prompt = (options: PromptOptions) => {
    setPromptOptions(options);
    return new Promise<string | null>((resolve) => {
      setPromptResolver(() => resolve);
    });
  };

  const handleConfirm = () => {
    setConfirmOptions(null);
    confirmResolver(true);
  };

  const handleCancel = () => {
    setConfirmOptions(null);
    confirmResolver(false);
  };

  const handlePromptConfirm = (value: string) => {
    setPromptOptions(null);
    promptResolver(value);
  };

  const handlePromptCancel = () => {
    setPromptOptions(null);
    promptResolver(null);
  };

  return (
    <AppContext.Provider
      value={{ user, setUser, confirm, prompt, alert, loading, setMode, mode, exportedRows, setExportedRows }}
    >
      {children}
      {confirmOptions && <Confirmation open {...confirmOptions} onConfirm={handleConfirm} onCancel={handleCancel} />}
      {alertOptions && <AlertModal open {...alertOptions} onConfirm={handleAlertConfirm} />}
      {promptOptions && (
        <PromptModal open {...promptOptions} onConfirm={handlePromptConfirm} onCancel={handlePromptCancel} />
      )}
    </AppContext.Provider>
  );
};
