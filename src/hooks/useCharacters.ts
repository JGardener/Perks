import { getCharacters } from "../services/dbdApi";
import { useAsyncData } from "./useAsyncData";

const fetchCharacterMap = async (): Promise<Record<number, string>> => {
  const data = await getCharacters();
  return Object.fromEntries(
    Object.entries(data).map(([key, character]) => [Number(key), character.name]),
  );
};

export const useCharacters = () => {
  const { data: characterMap, loading, error, retry } = useAsyncData(fetchCharacterMap, {} as Record<number, string>);
  return { characterMap, loading, error, retry };
};
