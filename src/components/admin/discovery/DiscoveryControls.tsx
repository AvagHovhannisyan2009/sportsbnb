import React, { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Scan, MapPin, Zap, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const REGIONS = [
  { key: "yerevan", label: "Yerevan", emoji: "🏙️" },
  { key: "gyumri", label: "Gyumri", emoji: "🏘️" },
  { key: "vanadzor", label: "Vanadzor", emoji: "🏘️" },
  { key: "kotayk", label: "Kotayk Province", emoji: "🏔️" },
  { key: "armavir", label: "Armavir Province", emoji: "🌾" },
  { key: "ararat", label: "Ararat Province", emoji: "🗻" },
  { key: "aragatsotn", label: "Aragatsotn Province", emoji: "⛰️" },
  { key: "gegharkunik", label: "Gegharkunik Province", emoji: "🌊" },
  { key: "lori", label: "Lori Province", emoji: "🌲" },
  { key: "tavush", label: "Tavush Province", emoji: "🌿" },
  { key: "syunik", label: "Syunik Province", emoji: "🏔️" },
  { key: "vayots_dzor", label: "Vayots Dzor Province", emoji: "🍇" },
  { key: "shirak", label: "Shirak Province", emoji: "❄️" },
];

const useRunDiscovery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      region?: string;
      tile_key?: string;
      force?: boolean;
      scan_mode?: string;
      max_tiles?: number;
      custom_lat?: number;
      custom_lng?: number;
      custom_radius?: number;
    }) => {
      const { data, error } = await supabase.functions.invoke("discover-fields", {
        body: { force: true, ...params },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-candidate-fields"] });
      queryClient.invalidateQueries({ queryKey: ["verified-fields"] });
      const remaining = data.tiles_remaining > 0
        ? ` (${data.tiles_remaining} tiles remaining — run again to continue)`
        : "";
      toast.success(
        `Discovery: ${data.candidates_added} found, ${data.auto_approved} auto-approved, ${data.flagged_for_review} flagged, ${data.rejected_by_ai} rejected (${data.tiles_scanned}/${data.total_tiles} tiles)${remaining}`
      );
    },
    onError: (e) => toast.error(`Discovery failed: ${e.message}`),
  });
};

const DiscoveryControls: React.FC = () => {
  const runDiscovery = useRunDiscovery();
  const [selectedRegion, setSelectedRegion] = useState<string>("yerevan");
  const [scanMode, setScanMode] = useState<string>("fast");
  const [maxTiles, setMaxTiles] = useState<number>(10);
  const [showCustom, setShowCustom] = useState(false);
  const [customLat, setCustomLat] = useState<string>("40.1772");
  const [customLng, setCustomLng] = useState<string>("44.5126");
  const [customRadius, setCustomRadius] = useState<string>("2000");

  const handleRegionScan = () => {
    runDiscovery.mutate({
      region: selectedRegion,
      scan_mode: scanMode,
      max_tiles: maxTiles,
    });
  };

  const handleFullScan = () => {
    runDiscovery.mutate({
      region: "all",
      scan_mode: scanMode,
      max_tiles: maxTiles,
    });
  };

  const handleCustomScan = () => {
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    const radius = parseInt(customRadius);
    if (isNaN(lat) || isNaN(lng)) {
      toast.error("Please enter valid coordinates");
      return;
    }
    runDiscovery.mutate({
      custom_lat: lat,
      custom_lng: lng,
      custom_radius: Math.min(radius || 2000, 5000),
      scan_mode: scanMode,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-5 w-5 text-primary" />
          AI Field Discovery
        </CardTitle>
        <CardDescription>
          Scan regions or custom areas for sports fields. Results are AI-verified automatically.
          Scans are batched to avoid timeouts — run multiple times for large regions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Settings row */}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Scan Mode</Label>
            <Select value={scanMode} onValueChange={setScanMode}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fast"><Zap className="h-3 w-3 inline mr-1" />Fast (12 queries)</SelectItem>
                <SelectItem value="full"><Search className="h-3 w-3 inline mr-1" />Full (40 queries)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Max Tiles / Batch</Label>
            <Select value={String(maxTiles)} onValueChange={(v) => setMaxTiles(Number(v))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 tiles</SelectItem>
                <SelectItem value="10">10 tiles</SelectItem>
                <SelectItem value="15">15 tiles</SelectItem>
                <SelectItem value="20">20 tiles</SelectItem>
                <SelectItem value="30">30 tiles</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Region scan */}
        <div className="flex flex-wrap gap-2 items-end">
          <div className="space-y-1 flex-1 min-w-[200px]">
            <Label className="text-xs text-muted-foreground">Region</Label>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map(r => (
                  <SelectItem key={r.key} value={r.key}>
                    {r.emoji} {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleRegionScan} disabled={runDiscovery.isPending}>
            {runDiscovery.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Scanning...</>
            ) : (
              <><Scan className="h-4 w-4 mr-2" /> Scan Region</>
            )}
          </Button>
          <Button variant="outline" onClick={handleFullScan} disabled={runDiscovery.isPending}>
            Scan All Armenia
          </Button>
        </div>

        {/* Quick region buttons */}
        <div className="flex flex-wrap gap-1.5">
          {REGIONS.map(r => (
            <Button
              key={r.key}
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              disabled={runDiscovery.isPending}
              onClick={() => {
                setSelectedRegion(r.key);
                runDiscovery.mutate({ region: r.key, scan_mode: scanMode, max_tiles: maxTiles });
              }}
            >
              {r.emoji} {r.label}
            </Button>
          ))}
        </div>

        {/* Custom area scan */}
        <div className="border-t border-border pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCustom(!showCustom)}
            className="text-xs text-muted-foreground mb-2"
          >
            <MapPin className="h-3 w-3 mr-1" />
            {showCustom ? "Hide" : "Show"} Custom Area Scan
          </Button>

          {showCustom && (
            <div className="flex flex-wrap gap-2 items-end">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Latitude</Label>
                <Input
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  placeholder="40.1772"
                  className="w-[120px]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Longitude</Label>
                <Input
                  value={customLng}
                  onChange={(e) => setCustomLng(e.target.value)}
                  placeholder="44.5126"
                  className="w-[120px]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Radius (m)</Label>
                <Input
                  value={customRadius}
                  onChange={(e) => setCustomRadius(e.target.value)}
                  placeholder="2000"
                  className="w-[100px]"
                />
              </div>
              <Button onClick={handleCustomScan} disabled={runDiscovery.isPending} size="sm">
                <MapPin className="h-4 w-4 mr-1" /> Scan Area
              </Button>
            </div>
          )}
        </div>

        {runDiscovery.isPending && (
          <p className="text-xs text-muted-foreground">
            Scanning in progress — this may take 1-3 minutes depending on batch size...
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DiscoveryControls;
