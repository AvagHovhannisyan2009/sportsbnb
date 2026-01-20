import { ExternalLink, Loader2, CheckCircle, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useStripeConnect } from '@/hooks/useStripeConnect';

interface StripeConnectBannerProps {
  variant?: 'banner' | 'inline';
}

export const StripeConnectBanner = ({ variant = 'banner' }: StripeConnectBannerProps) => {
  const { 
    isLoading, 
    isCheckingStatus, 
    startOnboarding, 
    canReceivePayouts,
  } = useStripeConnect();

  if (isCheckingStatus) {
    return (
      <Alert className="border-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>Checking payout status...</AlertTitle>
      </Alert>
    );
  }

  // Bank account linked - can receive payouts
  if (canReceivePayouts) {
    if (variant === 'inline') return null;
    
    return (
      <Alert className="border-primary/20 bg-primary/5">
        <CheckCircle className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary">Payouts Enabled</AlertTitle>
        <AlertDescription className="text-muted-foreground">
          Your bank account is linked. You'll receive 90% of each booking directly to your account.
        </AlertDescription>
      </Alert>
    );
  }

  // No bank account linked
  return (
    <Alert className="border-amber-500/50 bg-amber-500/10">
      <CreditCard className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-700 dark:text-amber-400">Link Bank Account for Payouts</AlertTitle>
      <AlertDescription className="space-y-3">
        <p className="text-muted-foreground">
          To receive payouts from bookings, link your bank account. Your venues can still be listed and booked while you set this up.
        </p>
        <Button 
          onClick={startOnboarding} 
          disabled={isLoading}
          variant="default"
          size="sm"
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Setting up...
            </>
          ) : (
            <>
              <ExternalLink className="h-4 w-4" />
              Link Bank Account
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
};
