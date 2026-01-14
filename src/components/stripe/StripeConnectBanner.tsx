import { AlertTriangle, ExternalLink, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useStripeConnect } from '@/hooks/useStripeConnect';

interface StripeConnectBannerProps {
  variant?: 'banner' | 'inline';
}

export const StripeConnectBanner = ({ variant = 'banner' }: StripeConnectBannerProps) => {
  const { connectStatus, isLoading, isCheckingStatus, startOnboarding, canListVenues } = useStripeConnect();

  if (isCheckingStatus) {
    return (
      <Alert className="border-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>Checking bank account status...</AlertTitle>
      </Alert>
    );
  }

  if (canListVenues) {
    if (variant === 'inline') return null;
    
    return (
      <Alert className="border-primary/20 bg-primary/5">
        <CheckCircle className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary">Bank Account Connected</AlertTitle>
        <AlertDescription className="text-muted-foreground">
          You're all set to receive payouts. You'll earn 90% of each booking.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Bank Account Required</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>
          To list venues and receive payouts, you must link your bank account. 
          You'll receive 90% of each booking directly to your account.
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
