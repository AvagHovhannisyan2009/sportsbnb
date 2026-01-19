import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, CreditCard, Loader2, Plus, Minus, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { getCustomerPrice, formatPrice } from "@/lib/pricing";
import { useVenueEquipment, VenueEquipment } from "@/hooks/useVenueEquipment";

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

interface SelectedEquipment {
  id: string;
  quantity: number;
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
  const [selectedEquipment, setSelectedEquipment] = useState<SelectedEquipment[]>([]);
  
  const { data: equipment = [], isLoading: equipmentLoading } = useVenueEquipment(venue.id);
  
  const availableEquipment = equipment.filter(e => e.is_available);
  const items = availableEquipment.filter(e => e.equipment_type === 'item');
  const packages = availableEquipment.filter(e => e.equipment_type === 'package');

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

  const toggleEquipment = (equipmentId: string) => {
    setSelectedEquipment(prev => {
      const existing = prev.find(e => e.id === equipmentId);
      if (existing) {
        return prev.filter(e => e.id !== equipmentId);
      }
      return [...prev, { id: equipmentId, quantity: 1 }];
    });
  };

  const updateQuantity = (equipmentId: string, delta: number) => {
    setSelectedEquipment(prev => 
      prev.map(e => {
        if (e.id === equipmentId) {
          const newQuantity = Math.max(1, e.quantity + delta);
          return { ...e, quantity: newQuantity };
        }
        return e;
      })
    );
  };

  const equipmentTotal = useMemo(() => {
    return selectedEquipment.reduce((total, sel) => {
      const eq = equipment.find(e => e.id === sel.id);
      if (eq) {
        return total + (eq.price * sel.quantity);
      }
      return total;
    }, 0);
  }, [selectedEquipment, equipment]);

  const venuePrice = getCustomerPrice(venue.price);
  const grandTotal = venuePrice + equipmentTotal;

  const handleProceedToPayment = async () => {
    if (!user) {
      toast.error("Please log in to book");
      navigate("/login");
      return;
    }

    setIsProcessing(true);

    try {
      const equipmentDetails = selectedEquipment.map(sel => {
        const eq = equipment.find(e => e.id === sel.id);
        return {
          id: sel.id,
          name: eq?.name || '',
          quantity: sel.quantity,
          price: eq?.price || 0,
          total: (eq?.price || 0) * sel.quantity
        };
      });

      const { data, error } = await supabase.functions.invoke("create-booking-checkout", {
        body: {
          venueId: venue.id,
          venueName: venue.name,
          venueLocation: venue.location,
          price: venue.price,
          bookingDate: calculateBookingDate(),
          bookingTime: selectedTime,
          dateLabel: selectedDateLabel,
          equipment: equipmentDetails,
          equipmentTotal: equipmentTotal,
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
    setSelectedEquipment([]);
    onClose();
  };

  const renderEquipmentSection = (title: string, equipmentList: VenueEquipment[], icon: React.ReactNode) => {
    if (equipmentList.length === 0) return null;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {icon}
          <span>{title}</span>
        </div>
        <div className="space-y-2">
          {equipmentList.map((eq) => {
            const selected = selectedEquipment.find(s => s.id === eq.id);
            const isSelected = !!selected;
            
            return (
              <div 
                key={eq.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={isSelected}
                    onCheckedChange={() => toggleEquipment(eq.id)}
                  />
                  <div>
                    <p className="text-sm font-medium">{eq.name}</p>
                    {eq.description && (
                      <p className="text-xs text-muted-foreground">{eq.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isSelected && eq.equipment_type === 'item' && (
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => updateQuantity(eq.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm">{selected.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => updateQuantity(eq.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <Badge variant="secondary" className="font-medium">
                    {formatPrice(eq.price)}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Confirm Your Booking</DialogTitle>
          <DialogDescription>
            Review your booking details and proceed to secure payment.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
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

            {/* Equipment Rental Section */}
            {!equipmentLoading && availableEquipment.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Add Equipment Rentals</h4>
                {renderEquipmentSection("Individual Items", items, <Package className="h-4 w-4" />)}
                {renderEquipmentSection("Packages", packages, <Package className="h-4 w-4" />)}
              </div>
            )}

            {/* Pricing Summary */}
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">Venue (1 hour)</span>
                <span className="font-medium">{formatPrice(venuePrice)}</span>
              </div>
              
              {selectedEquipment.length > 0 && (
                <>
                  {selectedEquipment.map(sel => {
                    const eq = equipment.find(e => e.id === sel.id);
                    if (!eq) return null;
                    return (
                      <div key={sel.id} className="flex items-center justify-between py-1 text-sm">
                        <span className="text-muted-foreground">
                          {eq.name} {sel.quantity > 1 && `× ${sel.quantity}`}
                        </span>
                        <span>{formatPrice(eq.price * sel.quantity)}</span>
                      </div>
                    );
                  })}
                </>
              )}
              
              <div className="flex items-center justify-between py-2 border-t border-border">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">{formatPrice(grandTotal)}</span>
              </div>
            </div>
          </div>
        </ScrollArea>

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
                Pay {formatPrice(grandTotal)}
              </>
            )}
          </Button>
        </DialogFooter>

        <p className="text-xs text-muted-foreground text-center">
          Secure payment powered by Stripe. Free cancellation up to 48 hours before.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
