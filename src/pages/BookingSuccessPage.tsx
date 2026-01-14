import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Calendar, Clock, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const BookingSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [bookingDetails, setBookingDetails] = useState<{
    venueName: string;
    bookingDate: string;
    bookingTime: string;
  } | null>(null);

  useEffect(() => {
    const processBooking = async () => {
      const sessionId = searchParams.get("session_id");
      
      if (!sessionId || !user) {
        setIsProcessing(false);
        return;
      }

      try {
        // Verify payment and create booking via edge function
        const { data, error } = await supabase.functions.invoke("verify-booking-payment", {
          body: { sessionId },
        });

        if (error) throw error;

        if (data?.booking) {
          setBookingDetails({
            venueName: data.booking.venue_name,
            bookingDate: data.booking.booking_date,
            bookingTime: data.booking.booking_time,
          });
          toast.success("Payment successful! Your booking is confirmed.");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        toast.error("There was an issue confirming your booking. Please contact support.");
      } finally {
        setIsProcessing(false);
      }
    };

    processBooking();
  }, [searchParams, user]);

  if (isProcessing) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Processing your booking...</h1>
          <p className="text-muted-foreground mt-2">Please wait while we confirm your payment.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-3">Booking Confirmed!</h1>
          <p className="text-muted-foreground mb-8">
            Your payment was successful and your venue has been booked.
          </p>

          {bookingDetails && (
            <div className="bg-card rounded-xl border border-border p-6 mb-8 text-left">
              <h2 className="font-semibold text-foreground mb-4">{bookingDetails.venueName}</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(bookingDetails.bookingDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{bookingDetails.bookingTime}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => navigate("/discover")} className="flex-1">
              Browse More Venues
            </Button>
            <Button onClick={() => navigate("/dashboard")} className="flex-1">
              View My Bookings
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookingSuccessPage;
