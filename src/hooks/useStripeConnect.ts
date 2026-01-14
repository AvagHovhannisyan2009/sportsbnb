import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ConnectStatus {
  hasAccount: boolean;
  onboardingComplete: boolean;
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
  accountId?: string;
}

export const useStripeConnect = () => {
  const { user, profile } = useAuth();
  const [connectStatus, setConnectStatus] = useState<ConnectStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const checkConnectStatus = useCallback(async () => {
    if (!user) return;
    
    setIsCheckingStatus(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-connect-status');
      
      if (error) throw error;
      setConnectStatus(data);
    } catch (error) {
      console.error('Error checking connect status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  }, [user]);

  const startOnboarding = async () => {
    if (!user) {
      toast.error('Please log in to continue');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-connect-account');
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No onboarding URL received');
      }
    } catch (error) {
      console.error('Error starting onboarding:', error);
      toast.error('Failed to start bank account setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && profile?.user_type === 'owner') {
      checkConnectStatus();
    }
  }, [user, profile?.user_type, checkConnectStatus]);

  // Check for return from Stripe onboarding
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('stripe_onboarding') === 'complete') {
      checkConnectStatus();
      toast.success('Bank account setup completed!');
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (urlParams.get('stripe_refresh') === 'true') {
      startOnboarding();
    }
  }, [checkConnectStatus]);

  return {
    connectStatus,
    isLoading,
    isCheckingStatus,
    startOnboarding,
    checkConnectStatus,
    canListVenues: connectStatus?.onboardingComplete === true,
  };
};
