import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Calendar, Clock, MapPin } from "lucide-react";
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
  const [isBooking, setIsBooking] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirmBooking = async () => {
    if (!user) {
      toast.error("Please log in to book");
      navigate("/login");
      return;
    }

    setIsBooking(true);

    // Calculate actual date from selectedDate value
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

    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      venue_id: venue.id,
      venue_name: venue.name,
      booking_date: bookingDate.toISOString().split("T")[0],
      booking_time: selectedTime,
      duration_hours: 1,
      total_price: venue.price,
    });

    if (error) {
      toast.error("Failed to create booking. Please try again.");
      console.error("Booking error:", error);
      setIsBooking(false);
      return;
    }

    setIsBooking(false);
    setIsConfirmed(true);
    toast.success("Booking confirmed!");
  };

  const handleClose = () => {
    setIsConfirmed(false);
    onClose();
  };

  const handleViewBookings = () => {
    handleClose();
    navigate("/dashboard");
  };

  if (isConfirmed) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center text-center py-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl">Booking Confirmed!</DialogTitle>
              <DialogDescription className="text-base mt-2">
                Your booking at {venue.name} has been confirmed for{" "}
                {selectedDateLabel} at {selectedTime}.
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Continue Browsing
            </Button>
            <Button onClick={handleViewBookings} className="flex-1">
              View My Bookings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Your Booking</DialogTitle>
          <DialogDescription>
            Review your booking details before confirming.
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
            <span className="text-xl font-bold">${venue.price}</span>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmBooking}
            disabled={isBooking}
            className="flex-1"
          >
            {isBooking ? "Processing..." : "Confirm Booking"}
          </Button>
        </DialogFooter>

        <p className="text-xs text-muted-foreground text-center">
          Free cancellation up to 24 hours before your booking
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
