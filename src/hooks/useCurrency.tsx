import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

// Currency configurations with symbols and locale info
export const CURRENCIES: Record<string, { symbol: string; name: string; locale: string }> = {
  USD: { symbol: "$", name: "US Dollar", locale: "en-US" },
  EUR: { symbol: "€", name: "Euro", locale: "de-DE" },
  GBP: { symbol: "£", name: "British Pound", locale: "en-GB" },
  AMD: { symbol: "֏", name: "Armenian Dram", locale: "hy-AM" },
  RUB: { symbol: "₽", name: "Russian Ruble", locale: "ru-RU" },
  GEL: { symbol: "₾", name: "Georgian Lari", locale: "ka-GE" },
  TRY: { symbol: "₺", name: "Turkish Lira", locale: "tr-TR" },
  AED: { symbol: "د.إ", name: "UAE Dirham", locale: "ar-AE" },
  INR: { symbol: "₹", name: "Indian Rupee", locale: "hi-IN" },
  JPY: { symbol: "¥", name: "Japanese Yen", locale: "ja-JP" },
  CNY: { symbol: "¥", name: "Chinese Yuan", locale: "zh-CN" },
  KRW: { symbol: "₩", name: "South Korean Won", locale: "ko-KR" },
  BRL: { symbol: "R$", name: "Brazilian Real", locale: "pt-BR" },
  CAD: { symbol: "CA$", name: "Canadian Dollar", locale: "en-CA" },
  AUD: { symbol: "A$", name: "Australian Dollar", locale: "en-AU" },
};

// Country to currency mapping for auto-detection
const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  US: "USD",
  GB: "GBP",
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  NL: "EUR",
  BE: "EUR",
  AT: "EUR",
  PT: "EUR",
  IE: "EUR",
  FI: "EUR",
  GR: "EUR",
  AM: "AMD",
  RU: "RUB",
  GE: "GEL",
  TR: "TRY",
  AE: "AED",
  IN: "INR",
  JP: "JPY",
  CN: "CNY",
  KR: "KRW",
  BR: "BRL",
  CA: "CAD",
  AU: "AUD",
};

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  formatPrice: (amount: number) => string;
  isLoading: boolean;
  detectedCurrency: string | null;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [currency, setCurrencyState] = useState<string>("USD");
  const [detectedCurrency, setDetectedCurrency] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-detect currency based on user's location
  useEffect(() => {
    const detectCurrency = async () => {
      try {
        // Try to get user's country from timezone or IP
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // Map common timezones to countries
        const timezoneCountryMap: Record<string, string> = {
          "Asia/Yerevan": "AM",
          "Europe/Moscow": "RU",
          "Europe/London": "GB",
          "Europe/Paris": "FR",
          "Europe/Berlin": "DE",
          "America/New_York": "US",
          "America/Los_Angeles": "US",
          "America/Chicago": "US",
          "Asia/Tokyo": "JP",
          "Asia/Seoul": "KR",
          "Asia/Shanghai": "CN",
          "Asia/Kolkata": "IN",
          "Asia/Dubai": "AE",
          "Europe/Istanbul": "TR",
          "Asia/Tbilisi": "GE",
          "America/Sao_Paulo": "BR",
          "America/Toronto": "CA",
          "Australia/Sydney": "AU",
        };

        const countryCode = timezoneCountryMap[timezone];
        if (countryCode && COUNTRY_CURRENCY_MAP[countryCode]) {
          setDetectedCurrency(COUNTRY_CURRENCY_MAP[countryCode]);
        }
      } catch (error) {
        console.error("Error detecting currency:", error);
      }
    };

    detectCurrency();
  }, []);

  // Load user's preferred currency from profile
  useEffect(() => {
    const loadCurrency = async () => {
      setIsLoading(true);
      
      // Check profile for saved preference
      if (profile) {
        const savedCurrency = (profile as any).preferred_currency;
        if (savedCurrency && CURRENCIES[savedCurrency]) {
          setCurrencyState(savedCurrency);
          setIsLoading(false);
          return;
        }
      }

      // Fall back to detected currency or USD
      if (detectedCurrency) {
        setCurrencyState(detectedCurrency);
      }
      
      setIsLoading(false);
    };

    loadCurrency();
  }, [profile, detectedCurrency]);

  // Save currency preference to profile
  const setCurrency = async (newCurrency: string) => {
    setCurrencyState(newCurrency);
    
    if (user) {
      try {
        await supabase
          .from("profiles")
          .update({ preferred_currency: newCurrency })
          .eq("user_id", user.id);
      } catch (error) {
        console.error("Error saving currency preference:", error);
      }
    }
    
    // Also save to localStorage for non-logged-in users
    localStorage.setItem("preferred_currency", newCurrency);
  };

  // Format price with currency
  const formatPrice = (amount: number): string => {
    const currencyInfo = CURRENCIES[currency] || CURRENCIES.USD;
    
    try {
      return new Intl.NumberFormat(currencyInfo.locale, {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      // Fallback formatting
      return `${currencyInfo.symbol}${amount.toLocaleString()}`;
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        isLoading,
        detectedCurrency,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
