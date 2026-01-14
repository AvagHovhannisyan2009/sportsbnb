import { AlertTriangle, ExternalLink, CheckCircle, Loader2, Clock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useStripeConnect } from '@/hooks/useStripeConnect';

interface StripeConnectBannerProps {
  variant?: 'banner' | 'inline';
}

export const StripeConnectBanner = ({ variant = 'banner' }: StripeConnectBannerProps) => {
  const { 
    connectStatus, 
    isLoading, 
    isCheckingStatus, 
    startOnboarding, 
    canListVenues,
    isFullyVerified,
    identityVerified,
    pendingVerification 
  } = useStripeConnect();

  if (isCheckingStatus) {
    return (
      <Alert className="border-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>Checking verification status...</AlertTitle>
      </Alert>
    );
  }

  // Fully verified - all good
  if (isFullyVerified) {
    if (variant === 'inline') return null;
    
    return (
      <Alert className="border-primary/20 bg-primary/5">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary">Fully Verified</AlertTitle>
        <AlertDescription className="text-muted-foreground">
          Your identity and bank account are verified. Your venues are visible to players and you'll earn 90% of each booking.
        </AlertDescription>
      </Alert>
    );
  }

  // Bank linked but pending ID verification
  if (canListVenues && pendingVerification) {
    return (
      <Alert className="border-amber-500/50 bg-amber-500/10">
        <Clock className="h-4 w-4 text-amber-500" />
        <AlertTitle className="text-amber-700 dark:text-amber-400">Identity Verification Pending</AlertTitle>
        <AlertDescription className="space-y-3">
          <p className="text-muted-foreground">
            Your bank account is linked, but identity verification is still being processed. 
            Your venues will become visible to players once verification is complete (usually within 1-2 business days).
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  // Bank linked but ID not verified - needs to complete verification
  if (canListVenues && !identityVerified) {
    return (
      <Alert className="border-amber-500/50 bg-amber-500/10">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <AlertTitle className="text-amber-700 dark:text-amber-400">Identity Verification Required</AlertTitle>
        <AlertDescription className="space-y-3">
          <p className="text-muted-foreground">
            Your bank account is linked, but you need to complete identity verification before your venues can go live. 
            This is required to receive payouts.
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
                Loading...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                Complete Identity Verification
              </>
            )}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // No bank account linked at all
  return (
    <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Bank Account & Identity Verification Required</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>
          To list venues and receive payouts, you must:
        </p>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Link your bank account for payouts</li>
          <li>Verify your identity (ID document required)</li>
        </ul>
        <p className="text-sm">
          Once verified, your venues will become visible and you'll receive 90% of each booking directly to your account.
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
              Start Verification
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
};
