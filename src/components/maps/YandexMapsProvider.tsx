import React from "react";
import { YMaps } from "@pbe/react-yandex-maps";

const YANDEX_MAPS_API_KEY = "0182c04c-963d-409f-a83d-26b2fb34547e";

interface YandexMapsProviderProps {
  children: React.ReactNode;
}

export const YandexMapsProvider: React.FC<YandexMapsProviderProps> = ({ children }) => {
  return (
    <YMaps query={{ apikey: YANDEX_MAPS_API_KEY, lang: "en_US" }}>
      {children}
    </YMaps>
  );
};
