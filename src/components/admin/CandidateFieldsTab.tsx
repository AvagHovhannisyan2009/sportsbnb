import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, XCircle, MapPin, Scan, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";

const useCandidateFields = () => {
  return useQuery({
    queryKey: ["admin-candidate-fields"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidate_fields")
        .select("*")
        .order("confidence_score", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

const useApproveCandidate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ candidate, approved, name }: { candidate: any; approved: boolean; name?: string }) => {
      if (approved && name) {
        // Insert into verified_fields
        const { error: insertError } = await supabase.from("verified_fields").insert({
          candidate_id: candidate.id,
          name,
          latitude: candidate.latitude,
          longitude: candidate.longitude,
          sport_type: candidate.detected_sport_type,
          city: "Yerevan",
          is_public: true,
          verification_status: "verified",
        } as any);
        if (insertError) throw insertError;
      }

      // Update candidate status
      const { error } = await supabase
        .from("candidate_fields")
        .update({
          status: approved ? "approved" : "rejected",
          reviewed_at: new Date().toISOString(),
        } as any)
        .eq("id", candidate.id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin-candidate-fields"] });
      queryClient.invalidateQueries({ queryKey: ["verified-fields"] });
      toast.success(vars.approved ? "Field verified and added to map!" : "Candidate rejected");
    },
    onError: () => toast.error("Failed to process candidate"),
  });
};

const useRunDiscovery = () => {
  return useMutation({
    mutationFn: async (tileKey?: string) => {
      const { data, error } = await supabase.functions.invoke("discover-fields", {
        body: tileKey ? { tile_key: tileKey } : {},
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Discovery complete: ${data.candidates_added} new candidates found`);
    },
    onError: (e) => toast.error(`Discovery failed: ${e.message}`),
  });
};

const CandidateFieldsTab: React.FC = () => {
  const { data: candidates, isLoading, refetch } = useCandidateFields();
  const approveCandidate = useApproveCandidate();
  const runDiscovery = useRunDiscovery();
  const [approveNames, setApproveNames] = useState<Record<string, string>>({});

  const pending = candidates?.filter(c => c.status === "pending") || [];
  const processed = candidates?.filter(c => c.status !== "pending") || [];

  const handleApprove = (candidate: any) => {
    const name = approveNames[candidate.id];
    if (!name?.trim()) {
      toast.error("Please enter a name for this field");
      return;
    }
    approveCandidate.mutate({ candidate, approved: true, name: name.trim() });
  };

  const getConfidenceBadge = (score: number) => {
    if (score >= 0.85) return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">{(score * 100).toFixed(0)}%</Badge>;
    if (score >= 0.7) return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">{(score * 100).toFixed(0)}%</Badge>;
    return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">{(score * 100).toFixed(0)}%</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Discovery controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5 text-primary" />
            AI Field Discovery
          </CardTitle>
          <CardDescription>
            Run AI-powered detection to find sports fields across Armenia. 
            Detected candidates require manual approval before appearing on the map.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                runDiscovery.mutate(undefined);
                setTimeout(() => refetch(), 5000);
              }}
              disabled={runDiscovery.isPending}
            >
              {runDiscovery.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Scanning...</>
              ) : (
                <><Scan className="h-4 w-4 mr-2" /> Run Full Discovery</>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                runDiscovery.mutate("yerevan-center");
                setTimeout(() => refetch(), 5000);
              }}
              disabled={runDiscovery.isPending}
            >
              Scan Yerevan Center Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending candidates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-amber-500" />
            Pending Candidates ({pending.length})
          </CardTitle>
          <CardDescription>AI-detected sports field candidates awaiting verification</CardDescription>
        </CardHeader>
        <CardContent>
          {pending.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No pending candidates. Run discovery to detect new fields.</p>
          ) : (
            <div className="space-y-4">
              {pending.map(candidate => (
                <div key={candidate.id} className="rounded-lg border border-border p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground capitalize">{candidate.detected_sport_type}</span>
                        {getConfidenceBadge(Number(candidate.confidence_score))}
                        <Badge variant="outline" className="text-xs">{candidate.detection_source}</Badge>
                      </div>
                      {(candidate.raw_metadata as any)?.name && (
                        <p className="text-sm font-medium text-foreground">
                          {(candidate.raw_metadata as any).name}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        📍 {(candidate.raw_metadata as any)?.address || `${candidate.latitude.toFixed(4)}, ${candidate.longitude.toFixed(4)}`}
                        {candidate.tile_key && ` • Tile: ${candidate.tile_key}`}
                      </p>
                      {(candidate.raw_metadata as any)?.rating && (
                        <p className="text-xs text-muted-foreground mt-1">
                          ⭐ {(candidate.raw_metadata as any).rating} ({(candidate.raw_metadata as any).user_rating_count || 0} reviews)
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Detected: {format(new Date(candidate.detection_timestamp), "MMM d, yyyy HH:mm")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Enter field name to approve..."
                      value={approveNames[candidate.id] || ""}
                      onChange={e => setApproveNames(prev => ({ ...prev, [candidate.id]: e.target.value }))}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleApprove(candidate)}
                      disabled={approveCandidate.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => approveCandidate.mutate({ candidate, approved: false })}
                      disabled={approveCandidate.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                  <a
                    href={`https://www.google.com/maps/@${candidate.latitude},${candidate.longitude},18z`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <Eye className="h-3 w-3" /> View on Google Maps (satellite)
                  </a>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processed candidates */}
      {processed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processed Candidates ({processed.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sport</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Detected</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processed.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium capitalize">{c.detected_sport_type}</TableCell>
                    <TableCell>{getConfidenceBadge(Number(c.confidence_score))}</TableCell>
                    <TableCell>{c.latitude.toFixed(3)}, {c.longitude.toFixed(3)}</TableCell>
                    <TableCell>{format(new Date(c.detection_timestamp), "MMM d")}</TableCell>
                    <TableCell>
                      <Badge className={c.status === "approved" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}>
                        {c.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CandidateFieldsTab;
