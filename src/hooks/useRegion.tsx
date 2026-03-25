import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Region = "AM" | "US" | "OTHER";

interface RegionContextType {
  region: Region;
  isArmenia: boolean;
  isUS: boolean;
  defaultCenter: { lat: number; lng: number };
  defaultZoom: number;
  regionLabel: string;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

const TIMEZONE_REGION_MAP: Record<string, Region> = {
  "Asia/Yerevan": "AM",
  "America/Los_Angeles": "US",
  "America/New_York": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Phoenix": "US",
  "America/Anchorage": "US",
  "Pacific/Honolulu": "US",
  "America/Detroit": "US",
  "America/Indiana/Indianapolis": "US",
  "America/Boise": "US",
};

const REGION_DEFAULTS: Record<Region, { center: { lat: number; lng: number }; zoom: number; label: string }> = {
  AM: { center: { lat: 40.1872, lng: 44.5152 }, zoom: 12, label: "Armenia" },
  US: { center: { lat: 34.0522, lng: -118.2437 }, zoom: 11, label: "Los Angeles, CA" },
  OTHER: { center: { lat: 40.1872, lng: 44.5152 }, zoom: 6, label: "Global" },
};

export const RegionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [region, setRegion] = useState<Region>(() => {
    const saved = localStorage.getItem("sportsbnb_region");
    if (saved === "AM" || saved === "US" || saved === "OTHER") return saved;
    return "OTHER";
  });

  useEffect(() => {
    const saved = localStorage.getItem("sportsbnb_region");
    if (saved === "AM" || saved === "US") return;

    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const detected = TIMEZONE_REGION_MAP[timezone] || "OTHER";
      setRegion(detected);
      localStorage.setItem("sportsbnb_region", detected);
    } catch {
      // Keep default
    }
  }, []);

  const defaults = REGION_DEFAULTS[region];

  return (
    <RegionContext.Provider
      value={{
        region,
        isArmenia: region === "AM",
        isUS: region === "US",
        defaultCenter: defaults.center,
        defaultZoom: defaults.zoom,
        regionLabel: defaults.label,
      }}
    >
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = () => {
  const context = useContext(RegionContext);
  if (context === undefined) {
    throw new Error("useRegion must be used within a RegionProvider");
  }
  return context;
};
