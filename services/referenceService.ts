import axios from "axios";
import { RefData } from "../type";

export const getAll = async (): Promise<RefData[]> => {
  const res = await fetch("/api/references");
  return res.json();
};
export const update = async () => {};
export const create = async () => {};
export const deleteReference = async (id) => {};
