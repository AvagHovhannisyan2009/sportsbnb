import { useState } from "react";
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isSameDay,
  parseISO,
  setHours,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  duration_hours: number;
  venue_name: string;
  total_price: number;
  status: string;
  customer_name?: string;
}

interface BlockedSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  reason?: string;
}

interface WeekCalendarProps {
  bookings: Booking[];
  blockedSlots?: BlockedSlot[];
  blockedDates?: { blocked_date: string; reason?: string | null }[];
  openingHours?: { day_of_week: number; open_time: string; close_time: string; is_closed: boolean }[];
  onBookingClick?: (booking: Booking) => void;
  onNewBooking?: (date: Date, time: string) => void;
  onBlockTime?: (date: Date) => void;
  resourceName?: string;
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 6); // 6 AM to 8 PM

export function WeekCalendar({
  bookings,
  blockedSlots = [],
  blockedDates = [],
  openingHours = [],
  onBookingClick,
  onNewBooking,
  onBlockTime,
  resourceName = "Court 1",
}: WeekCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  const isMobile = useIsMobile();

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getBookingsForDay = (day: Date) => {
    return bookings.filter((b) => {
      const bookingDate = parseISO(b.booking_date);
      return isSameDay(bookingDate, day);
    });
  };

  const getBlockedForDay = (day: Date) => {
    return blockedDates.filter((b) => {
      const blockedDate = parseISO(b.blocked_date);
      return isSameDay(blockedDate, day);
    });
  };

  const isOutsideOpeningHours = (day: Date, hour: number) => {
    const dayOfWeek = day.getDay();
    const hours = openingHours.find((h) => h.day_of_week === dayOfWeek);
    if (!hours) return false;
    if (hours.is_closed) return true;
    
    const openHour = parseInt(hours.open_time.split(":")[0]);
    const closeHour = parseInt(hours.close_time.split(":")[0]);
    return hour < openHour || hour >= closeHour;
  };

  const isDayBlocked = (day: Date) => {
    return getBlockedForDay(day).length > 0;
  };

  // Mobile: Single day view
  if (isMobile) {
    const selectedDay = weekDays[selectedDayIndex];
    const dayBookings = getBookingsForDay(selectedDay);
    const isBlocked = isDayBlocked(selectedDay);

    return (
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {/* Mobile Header */}
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground text-sm">{resourceName}</h3>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8 px-2"
                onClick={() => {
                  setCurrentWeek(new Date());
                  setSelectedDayIndex(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
                }}
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Day selector - horizontal scroll */}
          <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {weekDays.map((day, index) => (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDayIndex(index)}
                className={cn(
                  "flex flex-col items-center min-w-[44px] py-2 px-2 rounded-lg transition-colors",
                  selectedDayIndex === index
                    ? "bg-primary text-primary-foreground"
                    : isSameDay(day, new Date())
                    ? "bg-primary/10 text-primary"
                    : "bg-muted/50 text-foreground"
                )}
              >
                <span className="text-[10px] font-medium opacity-80">{format(day, "EEE")}</span>
                <span className="text-sm font-semibold">{format(day, "d")}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Action Buttons */}
        <div className="flex gap-2 p-3 border-b border-border">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 h-9 text-xs"
            onClick={onBlockTime ? () => onBlockTime(selectedDay) : undefined}
          >
            <Ban className="h-3.5 w-3.5 mr-1.5" />
            Block
          </Button>
          <Button 
            size="sm" 
            className="flex-1 h-9 text-xs"
            onClick={onNewBooking ? () => onNewBooking(selectedDay, "09:00") : undefined}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            New Booking
          </Button>
        </div>

        {/* Mobile Time Grid - Single Day */}
        <div className="max-h-[400px] overflow-y-auto">
          {HOURS.map((hour) => {
            const hourBookings = dayBookings.filter((b) => {
              const bookingHour = parseInt(b.booking_time.split(":")[0]);
              return bookingHour === hour;
            });
            const isClosed = isOutsideOpeningHours(selectedDay, hour);

            return (
              <div
                key={hour}
                className={cn(
                  "flex border-b border-border/50 min-h-[56px]",
                  isClosed && "bg-muted/50",
                  isBlocked && "bg-destructive/10"
                )}
              >
                <div className="w-14 p-2 text-xs text-muted-foreground text-right pr-2 py-3 flex-shrink-0 border-r border-border/50">
                  {format(setHours(new Date(), hour), "h a")}
                </div>
                <div className="flex-1 relative p-1">
                  {hourBookings.map((booking) => (
                    <div
                      key={booking.id}
                      onClick={() => onBookingClick?.(booking)}
                      className={cn(
                        "rounded-md p-2 cursor-pointer transition-all active:scale-[0.98]",
                        booking.status === "confirmed"
                          ? "bg-primary text-primary-foreground"
                          : booking.status === "pending"
                          ? "bg-amber-500 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                      style={{
                        minHeight: `${Math.max(booking.duration_hours * 48, 44)}px`,
                      }}
                    >
                      <div className="text-xs font-medium truncate">
                        {booking.customer_name || "Booking"}
                      </div>
                      <div className="text-[10px] opacity-80 truncate">
                        {booking.booking_time} • {booking.duration_hours}h
                      </div>
                    </div>
                  ))}
                  {isBlocked && !isClosed && hourBookings.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs text-destructive/70">Blocked</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Legend */}
        <div className="flex items-center justify-center gap-3 p-2 border-t border-border bg-muted/30">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded bg-primary" />
            <span className="text-[10px] text-muted-foreground">Confirmed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded bg-amber-500" />
            <span className="text-[10px] text-muted-foreground">Pending</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded bg-destructive/30" />
            <span className="text-[10px] text-muted-foreground">Blocked</span>
          </div>
        </div>
      </div>
    );
  }

  // Desktop: Full week view
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-foreground">{resourceName}</h3>
          <Badge variant="outline" className="text-xs">
            {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onBlockTime ? () => onBlockTime(new Date()) : undefined}>
            <Ban className="h-4 w-4 mr-2" />
            Block Time
          </Button>
          <Button size="sm" onClick={onNewBooking ? () => onNewBooking(new Date(), "09:00") : undefined}>
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Button>
          <div className="flex items-center border border-border rounded-lg ml-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => setCurrentWeek(new Date())}
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Day headers */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border">
            <div className="p-2 text-xs font-medium text-muted-foreground" />
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className={cn(
                  "p-3 text-center border-l border-border",
                  isSameDay(day, new Date()) && "bg-primary/5"
                )}
              >
                <div className="text-xs font-medium text-muted-foreground">
                  {format(day, "EEE")}
                </div>
                <div
                  className={cn(
                    "text-lg font-semibold mt-1",
                    isSameDay(day, new Date())
                      ? "text-primary"
                      : "text-foreground"
                  )}
                >
                  {format(day, "d")}
                </div>
              </div>
            ))}
          </div>

          {/* Time grid */}
          <div className="relative">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border/50"
              >
                <div className="p-2 text-xs text-muted-foreground text-right pr-3 py-4">
                  {format(setHours(new Date(), hour), "h a")}
                </div>
                {weekDays.map((day) => {
                  const dayBookings = getBookingsForDay(day).filter((b) => {
                    const bookingHour = parseInt(b.booking_time.split(":")[0]);
                    return bookingHour === hour;
                  });

                  const isBlocked = isDayBlocked(day);
                  const isClosed = isOutsideOpeningHours(day, hour);

                  return (
                    <div
                      key={`${day.toISOString()}-${hour}`}
                      className={cn(
                        "border-l border-border/50 min-h-[60px] relative",
                        isSameDay(day, new Date()) && "bg-primary/5",
                        isBlocked && "bg-destructive/10",
                        isClosed && "bg-muted/50 cursor-not-allowed"
                      )}
                    >
                      {dayBookings.map((booking) => (
                        <div
                          key={booking.id}
                          onClick={() => onBookingClick?.(booking)}
                          className={cn(
                            "absolute left-1 right-1 rounded-md p-2 cursor-pointer transition-all hover:ring-2 hover:ring-primary/50",
                            booking.status === "confirmed"
                              ? "bg-primary text-primary-foreground"
                              : booking.status === "pending"
                              ? "bg-amber-500 text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                          style={{
                            top: "2px",
                            height: `${booking.duration_hours * 60 - 4}px`,
                          }}
                        >
                          <div className="text-xs font-medium truncate">
                            {booking.customer_name || "Booking"}
                          </div>
                          <div className="text-xs opacity-80 truncate">
                            {booking.booking_time} • {booking.venue_name}
                          </div>
                        </div>
                      ))}
                      {isBlocked && !isClosed && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs text-destructive/70">Blocked</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 p-3 border-t border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary" />
          <span className="text-xs text-muted-foreground">Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-500" />
          <span className="text-xs text-muted-foreground">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-destructive/30" />
          <span className="text-xs text-muted-foreground">Blocked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-muted" />
          <span className="text-xs text-muted-foreground">Closed</span>
        </div>
      </div>
    </div>
  );
}

export default WeekCalendar;
