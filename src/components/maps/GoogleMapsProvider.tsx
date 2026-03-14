import React from "react";
import { LoadScript } from "@react-google-maps/api";

const GOOGLE_MAPS_API_KEY = "AIzaSyBXAFswT5JjEUw_FLuYzwCt03p-m2nYS14";

const libraries: ("places" | "geocoding")[] = ["places", "geocoding"];

interface GoogleMapsProviderProps {
  children: React.ReactNode;
}

export const GoogleMapsProvider: React.FC<GoogleMapsProviderProps> = ({ children }) => {
  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={libraries} language="en">
      {children}
    </LoadScript>
  );
};

export { GOOGLE_MAPS_API_KEY };
