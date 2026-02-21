import { useQuery } from "@tanstack/react-query";
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Droplets, Wind, Thermometer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface WeatherWidgetProps {
  latitude: number;
  longitude: number;
  isIndoor?: boolean;
}

const WMO_ICONS: Record<number, { icon: typeof Sun; label: string }> = {
  0: { icon: Sun, label: "Clear" },
  1: { icon: Sun, label: "Mostly clear" },
  2: { icon: Cloud, label: "Partly cloudy" },
  3: { icon: Cloud, label: "Overcast" },
  45: { icon: Cloud, label: "Foggy" },
  48: { icon: Cloud, label: "Icy fog" },
  51: { icon: CloudRain, label: "Light drizzle" },
  53: { icon: CloudRain, label: "Drizzle" },
  55: { icon: CloudRain, label: "Heavy drizzle" },
  61: { icon: CloudRain, label: "Light rain" },
  63: { icon: CloudRain, label: "Rain" },
  65: { icon: CloudRain, label: "Heavy rain" },
  71: { icon: CloudSnow, label: "Light snow" },
  73: { icon: CloudSnow, label: "Snow" },
  75: { icon: CloudSnow, label: "Heavy snow" },
  80: { icon: CloudRain, label: "Showers" },
  81: { icon: CloudRain, label: "Moderate showers" },
  82: { icon: CloudRain, label: "Heavy showers" },
  95: { icon: CloudLightning, label: "Thunderstorm" },
  96: { icon: CloudLightning, label: "Thunderstorm w/ hail" },
  99: { icon: CloudLightning, label: "Severe thunderstorm" },
};

const getWeatherInfo = (code: number) => WMO_ICONS[code] || WMO_ICONS[0];

const WeatherWidget = ({ latitude, longitude, isIndoor }: WeatherWidgetProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ["weather", latitude, longitude],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-weather", {
        body: { latitude, longitude },
      });
      if (error) throw error;
      return data;
    },
    staleTime: 30 * 60 * 1000, // 30 min
    enabled: !!latitude && !!longitude,
  });

  if (isLoading || !data?.current) return null;

  const current = data.current;
  const daily = data.daily;
  const weatherInfo = getWeatherInfo(current.weather_code);
  const Icon = weatherInfo.icon;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Thermometer className="h-5 w-5 text-primary" />
          Weather
          {isIndoor && (
            <span className="text-xs font-normal text-muted-foreground ml-auto">Indoor venue</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current */}
        <div className="flex items-center gap-4">
          <Icon className="h-10 w-10 text-primary" />
          <div>
            <p className="text-2xl font-bold text-foreground">{Math.round(current.temperature_2m)}°C</p>
            <p className="text-sm text-muted-foreground">{weatherInfo.label}</p>
          </div>
          <div className="ml-auto flex items-center gap-1 text-sm text-muted-foreground">
            <Wind className="h-4 w-4" />
            <span>{Math.round(current.wind_speed_10m)} km/h</span>
          </div>
        </div>

        {/* 5-day forecast */}
        {daily && (
          <div className="grid grid-cols-5 gap-1 pt-2 border-t border-border">
            {daily.time.slice(0, 5).map((date: string, i: number) => {
              const dayInfo = getWeatherInfo(daily.weather_code[i]);
              const DayIcon = dayInfo.icon;
              const dayLabel = i === 0 ? "Today" : new Date(date).toLocaleDateString("en", { weekday: "short" });
              return (
                <div key={date} className="text-center space-y-1">
                  <p className="text-xs text-muted-foreground">{dayLabel}</p>
                  <DayIcon className="h-5 w-5 mx-auto text-muted-foreground" />
                  <p className="text-xs font-medium text-foreground">
                    {Math.round(daily.temperature_2m_max[i])}°
                  </p>
                  {daily.precipitation_probability_max[i] > 20 && (
                    <div className="flex items-center justify-center gap-0.5 text-xs text-blue-500">
                      <Droplets className="h-3 w-3" />
                      {daily.precipitation_probability_max[i]}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
