import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Map, Placemark, YMaps } from "@pbe/react-yandex-maps";
import { MapPin, Users, Sun, Moon, Zap, Navigation, List, Map as MapIcon, Filter, ChevronRight, Plus, Check, Star, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePublicFields } from "@/hooks/usePublicFields";
import { useVenues } from "@/hooks/useVenues";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/seo/SEOHead";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import FieldRatingDialog from "@/components/fields/FieldRatingDialog";

const YANDEX_MAPS_API_KEY = "0182c04c-963d-409f-a83d-26b2fb34547e";

const SPORT_COLORS: Record<string, string> = {
  Football: "#22c55e",
  Basketball: "#f97316",
  Tennis: "#eab308",
  Volleyball: "#8b5cf6",
  Running: "#3b82f6",
  Cycling: "#06b6d4",
  Swimming: "#0ea5e9",
};

const getSportColor = (sports: string[]) => {
  if (!sports.length) return "#22c55e";
  return SPORT_COLORS[sports[0]] || "#22c55e";
};

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const NearbyFieldsPage: React.FC = () => {
  const navigate = useNavigate();
  const { fields, isLoading, checkIn, fetchFields } = usePublicFields();
  const { data: venues } = useVenues();
  const [view, setView] = useState<"map" | "list">("map");
  const [sportFilter, setSportFilter] = useState<string>("all");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [ratingField, setRatingField] = useState<{ id: string; name: string } | null>(null);

  const handleLocate = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocating(false);
        toast.success("Location found!");
      },
      () => {
        // Default to Yerevan center
        setUserLocation({ lat: 40.1872, lng: 44.5152 });
        setIsLocating(false);
        toast.info("Using Yerevan center as default location");
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  useEffect(() => {
    handleLocate();
  }, []);

  const allSports = useMemo(() => {
    const sports = new Set<string>();
    fields.forEach(f => f.sports.forEach(s => sports.add(s)));
    return Array.from(sports).sort();
  }, [fields]);

  const filteredFields = useMemo(() => {
    let result = fields;
    if (sportFilter !== "all") {
      result = result.filter(f => f.sports.includes(sportFilter));
    }
    if (userLocation) {
      result = result
        .map(f => ({ ...f, distance: getDistance(userLocation.lat, userLocation.lng, f.latitude, f.longitude) }))
        .sort((a, b) => a.distance - b.distance);
    }
    return result;
  }, [fields, sportFilter, userLocation]);

  const promotedVenues = useMemo(() => {
    if (!venues) return [];
    let result = venues.filter(v => v.is_active);
    if (sportFilter !== "all") {
      result = result.filter(v => v.sports?.includes(sportFilter));
    }
    if (userLocation) {
      result = result
        .filter(v => v.latitude && v.longitude)
        .map(v => ({ ...v, distance: getDistance(userLocation.lat, userLocation.lng, v.latitude!, v.longitude!) }))
        .sort((a, b) => (a as any).distance - (b as any).distance)
        .slice(0, 5);
    }
    return result;
  }, [venues, sportFilter, userLocation]);

  const mapCenter = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [40.1872, 44.5152];

  return (
    <Layout>
      <SEOHead
        title="Nearby Sports Fields | Sportsbnb"
        description="Discover free public sports fields and courts near you in Yerevan. See real-time occupancy, check in, and find the best spots to play."
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-16 z-30 bg-background/95 backdrop-blur border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-foreground">Nearby Fields</h1>
                <p className="text-sm text-muted-foreground">{filteredFields.length} free fields found</p>
              </div>

              <div className="flex items-center gap-2">
                <Select value={sportFilter} onValueChange={setSportFilter}>
                  <SelectTrigger className="w-32 h-9">
                    <Filter className="h-3.5 w-3.5 mr-1" />
                    <SelectValue placeholder="Sport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All sports</SelectItem>
                    {allSports.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex rounded-lg border border-border overflow-hidden">
                  <button
                    onClick={() => setView("map")}
                    className={cn(
                      "p-2 transition-colors",
                      view === "map" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <MapIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setView("list")}
                    className={cn(
                      "p-2 transition-colors",
                      view === "list" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                <Button variant="outline" size="sm" onClick={() => navigate("/nearby/submit")}>
                  <Plus className="h-4 w-4 mr-1" /> Add Field
                </Button>
              </div>
            </div>
          </div>
        </div>

        {view === "map" ? (
          <div className="h-[calc(100vh-180px)]">
            <YMaps query={{ apikey: YANDEX_MAPS_API_KEY, lang: "en_US" }}>
              <Map
                defaultState={{ center: mapCenter as [number, number], zoom: 13 }}
                width="100%"
                height="100%"
                state={{ center: mapCenter as [number, number], zoom: 13 }}
              >
                {/* User location */}
                {userLocation && (
                  <Placemark
                    geometry={[userLocation.lat, userLocation.lng]}
                    options={{
                      preset: "islands#geolocationIcon",
                    }}
                  />
                )}

                {/* Public fields - green */}
                {filteredFields.map(field => (
                  <Placemark
                    key={field.id}
                    geometry={[field.latitude, field.longitude]}
                    options={{
                      iconColor: getSportColor(field.sports),
                      preset: "islands#dotIcon",
                    }}
                    properties={{
                      balloonContentHeader: `<strong>🏟️ ${field.name}</strong> <span style="color:green">FREE</span>`,
                      balloonContentBody: `
                        <div style="max-width:250px">
                          <p>${field.sports.join(", ")} • ${field.surface_type || "N/A"}</p>
                          <p>${field.has_lighting ? "💡 Lit" : "🌙 No lights"} • ⭐ ${field.condition_rating}/5</p>
                          ${field.active_checkins > 0 ? `<p style="color:green">🟢 ${field.active_checkins} players here now</p>` : '<p style="color:gray">⚪ No one here right now</p>'}
                          ${field.address ? `<p style="font-size:12px;color:gray">${field.address}</p>` : ""}
                        </div>
                      `,
                    }}
                    modules={["geoObject.addon.balloon"]}
                  />
                ))}

                {/* Promoted venues - blue with star */}
                {promotedVenues.map(venue => (
                  <Placemark
                    key={`venue-${venue.id}`}
                    geometry={[venue.latitude!, venue.longitude!]}
                    options={{
                      iconColor: "#2563eb",
                      preset: "islands#blueStarIcon",
                    }}
                    properties={{
                      balloonContentHeader: `<strong>⭐ ${venue.name}</strong> <span style="color:#2563eb">BOOKABLE</span>`,
                      balloonContentBody: `
                        <div style="max-width:250px">
                          <p>${venue.sports?.join(", ")} • ₽${venue.price_per_hour}/hr</p>
                          <p>⭐ ${venue.rating || 0} (${venue.review_count || 0} reviews)</p>
                          <p>${venue.address || venue.city}</p>
                          <a href="/venue/${venue.id}" style="color:#2563eb;font-weight:bold">Book Now →</a>
                        </div>
                      `,
                    }}
                    modules={["geoObject.addon.balloon"]}
                  />
                ))}
              </Map>
            </YMaps>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
            {/* Promoted venues section */}
            {promotedVenues.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">⭐ Bookable Venues Near You</h2>
                {promotedVenues.slice(0, 3).map(venue => (
                  <Card
                    key={`venue-${venue.id}`}
                    className="p-4 cursor-pointer hover:bg-muted/50 transition-colors border-primary/20"
                    onClick={() => navigate(`/venue/${venue.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Zap className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground flex items-center gap-2">
                            {venue.name}
                            <Badge variant="secondary" className="text-xs">Bookable</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {venue.sports?.join(", ")} • ₽{venue.price_per_hour}/hr • ⭐ {venue.rating || 0}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Free fields */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">🏟️ Free Public Fields</h2>
              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">Loading fields...</div>
              ) : filteredFields.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No fields found for this sport</div>
              ) : (
                filteredFields.map((field: any) => (
                  <Card key={field.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${getSportColor(field.sports)}20` }}
                        >
                          <MapPin className="h-5 w-5" style={{ color: getSportColor(field.sports) }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground">{field.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm text-muted-foreground">
                              {field.sports.join(", ")} • {field.surface_type || "Unknown surface"}
                            </span>
                            {field.busyness_score && field.busyness_score !== "unknown" && (
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs",
                                  field.busyness_score === "likely_free" && "border-green-500/30 text-green-600 bg-green-500/5",
                                  field.busyness_score === "moderate" && "border-amber-500/30 text-amber-600 bg-amber-500/5",
                                  field.busyness_score === "busy" && "border-red-500/30 text-red-600 bg-red-500/5"
                                )}
                              >
                                {field.busyness_score === "likely_free" ? "🟢 Likely Free" :
                                 field.busyness_score === "moderate" ? "🟡 Moderate" :
                                 "🔴 Busy"}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                            {field.has_lighting && (
                              <span className="flex items-center gap-0.5"><Sun className="h-3 w-3" /> Lit</span>
                            )}
                            <span>⭐ {field.condition_rating}/5</span>
                            {field.distance !== undefined && (
                              <span>{field.distance < 1 ? `${Math.round(field.distance * 1000)}m` : `${field.distance.toFixed(1)}km`} away</span>
                            )}
                          </div>
                          {(field.peak_hours || field.best_time) && (
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              {field.peak_hours && (
                                <span className="flex items-center gap-0.5">
                                  <TrendingUp className="h-3 w-3" /> Peak: {field.peak_hours}
                                </span>
                              )}
                              {field.best_time && (
                                <span className="flex items-center gap-0.5">
                                  <Clock className="h-3 w-3" /> Best: {field.best_time}
                                </span>
                              )}
                            </div>
                          )}
                          {field.active_checkins > 0 && (
                            <div className="flex items-center gap-1 mt-1.5 text-xs text-green-600">
                              <Users className="h-3 w-3" />
                              {field.active_checkins} playing now
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); checkIn(field.id); }}
                        >
                          <Check className="h-3.5 w-3.5 mr-1" /> I'm here
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setRatingField({ id: field.id, name: field.name }); }}
                        >
                          <Star className="h-3.5 w-3.5 mr-1" /> Rate
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {ratingField && (
          <FieldRatingDialog
            open={!!ratingField}
            onOpenChange={(open) => !open && setRatingField(null)}
            fieldId={ratingField.id}
            fieldName={ratingField.name}
            onRated={() => fetchFields()}
          />
        )}
      </div>
    </Layout>
  );
};

export default NearbyFieldsPage;
