import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, CreditCard, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { getCustomerPrice, formatPrice } from "@/lib/pricing";

interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  venue: {
    id: string;
    name: string;
    location: string;
    price: number;
  };
  selectedDate: string;
  selectedDateLabel: string;
  selectedTime: string;
}

const BookingDialog = ({
  isOpen,
  onClose,
  venue,
  selectedDate,
  selectedDateLabel,
  selectedTime,
}: BookingDialogProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const calculateBookingDate = (): string => {
    const today = new Date();
    let bookingDate: Date;
    
    switch (selectedDate) {
      case "today":
        bookingDate = today;
        break;
      case "tomorrow":
        bookingDate = new Date(today);
        bookingDate.setDate(today.getDate() + 1);
        break;
      case "sat":
        bookingDate = new Date(today);
        bookingDate.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7 || 7));
        break;
      case "sun":
        bookingDate = new Date(today);
        bookingDate.setDate(today.getDate() + ((0 - today.getDay() + 7) % 7 || 7));
        break;
      case "mon":
        bookingDate = new Date(today);
        bookingDate.setDate(today.getDate() + ((1 - today.getDay() + 7) % 7 || 7));
        break;
      default:
        bookingDate = today;
    }
    
    return bookingDate.toISOString().split("T")[0];
  };

  const handleProceedToPayment = async () => {
    if (!user) {
      toast.error("Please log in to book");
      navigate("/login");
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-booking-checkout", {
        body: {
          venueId: venue.id,
          venueName: venue.name,
          venueLocation: venue.location,
          price: venue.price,
          bookingDate: calculateBookingDate(),
          bookingTime: selectedTime,
          dateLabel: selectedDateLabel,
        },
      });

      if (error) throw error;

      // Handle demo booking (venue without Stripe setup)
      if (data?.demo) {
        toast.success("Demo booking confirmed! 🎉");
        onClose();
        navigate("/dashboard");
        return;
      }

      // Handle real Stripe checkout
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to start checkout. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Your Booking</DialogTitle>
          <DialogDescription>
            Review your booking details and proceed to secure payment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-foreground">{venue.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{venue.location}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{selectedDateLabel}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{selectedTime}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground">Duration</span>
            <span className="font-medium">1 hour</span>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-border">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold">{formatPrice(getCustomerPrice(venue.price))}</span>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleClose} className="flex-1" disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={handleProceedToPayment}
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay {formatPrice(getCustomerPrice(venue.price))}
              </>
            )}
          </Button>
        </DialogFooter>

        <p className="text-xs text-muted-foreground text-center">
          Secure payment powered by Stripe. Free cancellation up to 24 hours before.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
