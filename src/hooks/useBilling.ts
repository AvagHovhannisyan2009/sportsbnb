import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  created: number;
  receiptUrl: string | null;
}

interface Subscription {
  id: string;
  status: string;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  plan: string;
  amount: number;
  currency: string;
  interval: string;
}

interface BillingInfo {
  paymentMethods: PaymentMethod[];
  invoices: Invoice[];
  subscriptions: Subscription[];
  hasCustomer: boolean;
  customerEmail?: string;
}

export const useBilling = () => {
  return useQuery({
    queryKey: ["billing-info"],
    queryFn: async (): Promise<BillingInfo> => {
      const { data, error } = await supabase.functions.invoke("get-billing-info");
      if (error) throw error;
      return data;
    },
    retry: 1,
    staleTime: 30000, // Cache for 30 seconds
  });
};

export const useOpenBillingPortal = () => {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("create-billing-portal");
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      console.error("Error opening billing portal:", error);
      toast.error("Failed to open billing portal");
    },
  });
};

export const formatCurrency = (amount: number, currency: string = "amd") => {
  if (currency.toLowerCase() === "amd") {
    return `֏${Math.round(amount / 100).toLocaleString()}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
};

export const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const getBrandIcon = (brand: string): string => {
  const brandMap: Record<string, string> = {
    visa: "VISA",
    mastercard: "MC",
    amex: "AMEX",
    discover: "DISC",
    jcb: "JCB",
    diners: "DC",
    unionpay: "UP",
  };
  return brandMap[brand.toLowerCase()] || brand.toUpperCase();
};
