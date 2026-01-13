import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { MapPin, Star, Clock, Users, Wifi, Car, Droplets, CheckCircle, ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/layout/Layout";
import { venues, timeSlots } from "@/data/mockData";

const VenueDetailsPage = () => {
  const { id } = useParams();
  const venue = venues.find((v) => v.id === id);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  if (!venue) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Venue not found</h1>
          <Link to="/discover">
            <Button>Back to Discover</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const amenityIcons: Record<string, React.ReactNode> = {
    Parking: <Car className="h-5 w-5" />,
    Showers: <Droplets className="h-5 w-5" />,
    Lockers: <CheckCircle className="h-5 w-5" />,
    Wifi: <Wifi className="h-5 w-5" />,
  };

  const dates = [
    { label: "Today", value: "today" },
    { label: "Tomorrow", value: "tomorrow" },
    { label: "Sat, Jan 18", value: "sat" },
    { label: "Sun, Jan 19", value: "sun" },
    { label: "Mon, Jan 20", value: "mon" },
  ];

  const availableSlots = timeSlots.slice(6, 14);

  return (
    <Layout>
      <div className="bg-background min-h-screen">
        {/* Back Navigation */}
        <div className="container py-4">
          <Link
            to="/discover"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to venues
          </Link>
        </div>

        {/* Image Gallery */}
        <div className="container pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="aspect-[4/3] rounded-xl overflow-hidden">
              <img
                src={venue.image}
                alt={venue.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden md:grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden bg-muted">
                  <img
                    src={venue.image}
                    alt={`${venue.name} view ${i}`}
                    className="w-full h-full object-cover opacity-80"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="container pb-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {venue.sports.map((sport) => (
                    <Badge key={sport} variant="secondary">
                      {sport}
                    </Badge>
                  ))}
                  {venue.indoor && (
                    <Badge variant="outline">Indoor</Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-3">{venue.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{venue.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="font-medium text-foreground">{venue.rating}</span>
                    <span>({venue.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">About this venue</h2>
                <p className="text-muted-foreground leading-relaxed">{venue.description}</p>
              </div>

              <Separator />

              {/* Amenities */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {venue.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-3 text-muted-foreground"
                    >
                      {amenityIcons[amenity] || <CheckCircle className="h-5 w-5" />}
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Availability */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Availability</h2>
                
                {/* Date Selection */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-foreground mb-3">Select date</h3>
                  <div className="flex flex-wrap gap-2">
                    {dates.map((date) => (
                      <Button
                        key={date.value}
                        variant={selectedDate === date.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedDate(date.value)}
                      >
                        {date.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-3">Select time</h3>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot}
                          variant={selectedTime === slot ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTime(slot)}
                          className="text-sm"
                        >
                          {slot}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Card */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold text-foreground">${venue.price}</span>
                  <span className="text-muted-foreground">/ hour</span>
                </div>

                {selectedDate && selectedTime ? (
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-medium text-foreground">
                        {dates.find((d) => d.value === selectedDate)?.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Time</span>
                      <span className="font-medium text-foreground">{selectedTime}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium text-foreground">1 hour</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">Total</span>
                      <span className="text-xl font-bold text-foreground">${venue.price}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mb-6">
                    Select a date and time to see availability and book.
                  </p>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  disabled={!selectedDate || !selectedTime}
                >
                  {selectedDate && selectedTime ? "Book Now" : "Select time to book"}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Free cancellation up to 24 hours before
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VenueDetailsPage;
