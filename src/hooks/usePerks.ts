import { getAllPerks } from "../services/dbdApi";
import type { Perk } from "../types/dbd";
import { useAsyncData } from "./useAsyncData";

const fetchPerks = async (): Promise<Perk[]> => Object.values(await getAllPerks());

export const usePerks = () => {
  const { data: perks, loading, error } = useAsyncData(fetchPerks, [] as Perk[]);
  return { perks, loading, error };
};
