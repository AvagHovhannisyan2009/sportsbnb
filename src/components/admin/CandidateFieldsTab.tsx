import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, XCircle, MapPin, Scan, Eye, AlertTriangle, Sparkles } from "lucide-react";
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tileKey?: string) => {
      const { data, error } = await supabase.functions.invoke("discover-fields", {
        body: tileKey ? { tile_key: tileKey } : {},
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-candidate-fields"] });
      queryClient.invalidateQueries({ queryKey: ["verified-fields"] });
      toast.success(
        `Discovery complete: ${data.candidates_added} found, ${data.auto_approved} auto-approved, ${data.flagged_for_review} flagged, ${data.rejected_by_ai} rejected by AI`
      );
    },
    onError: (e) => toast.error(`Discovery failed: ${e.message}`),
  });
};

const CandidateFieldsTab: React.FC = () => {
  const { data: candidates, isLoading, refetch } = useCandidateFields();
  const approveCandidate = useApproveCandidate();
  const runDiscovery = useRunDiscovery();
  const [approveNames, setApproveNames] = useState<Record<string, string>>({});

  const needsReview = candidates?.filter(c => c.status === "needs_review") || [];
  const pending = candidates?.filter(c => c.status === "pending") || [];
  const autoApprovedList = candidates?.filter(c => c.status === "auto_approved") || [];
  const processed = candidates?.filter(c => ["approved", "rejected"].includes(c.status)) || [];

  const handleApprove = (candidate: any) => {
    const meta = candidate.raw_metadata as any;
    const name = approveNames[candidate.id] || meta?.ai_suggested_name;
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "auto_approved":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><Sparkles className="h-3 w-3 mr-1" />Auto-Approved</Badge>;
      case "needs_review":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20"><AlertTriangle className="h-3 w-3 mr-1" />Needs Review</Badge>;
      case "approved":
        return <Badge className="bg-green-500/10 text-green-600">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-600">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderCandidateCard = (candidate: any, showActions: boolean) => {
    const meta = candidate.raw_metadata as any;
    return (
      <div key={candidate.id} className="rounded-lg border border-border p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-semibold text-foreground capitalize">{candidate.detected_sport_type}</span>
              {getConfidenceBadge(Number(candidate.confidence_score))}
              {getStatusBadge(candidate.status)}
            </div>
            {meta?.ai_suggested_name && (
              <p className="text-sm font-medium text-foreground">
                🏟️ {meta.ai_suggested_name}
              </p>
            )}
            {meta?.name && meta.name !== meta?.ai_suggested_name && (
              <p className="text-xs text-muted-foreground">
                Google: {meta.name}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              📍 {meta?.address || `${candidate.latitude.toFixed(4)}, ${candidate.longitude.toFixed(4)}`}
            </p>
            {meta?.rating && (
              <p className="text-xs text-muted-foreground mt-1">
                ⭐ {meta.rating} ({meta.user_rating_count || 0} reviews)
              </p>
            )}
            {meta?.ai_reason && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                🤖 AI: {meta.ai_reason}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Detected: {format(new Date(candidate.detection_timestamp), "MMM d, yyyy HH:mm")}
            </p>
          </div>
        </div>
        {showActions && (
          <div className="flex items-center gap-2">
            <Input
              placeholder={meta?.ai_suggested_name || "Enter field name..."}
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
        )}
        <a
          href={`https://www.google.com/maps/@${candidate.latitude},${candidate.longitude},18z`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          <Eye className="h-3 w-3" /> View on Google Maps
        </a>
      </div>
    );
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
            Scans Google Maps for sports fields (including public courts in residential areas), 
            then AI verifies each result. Verified fields are auto-approved; suspicious ones are flagged for your review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => runDiscovery.mutate(undefined)}
              disabled={runDiscovery.isPending}
            >
              {runDiscovery.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Scanning & Verifying...</>
              ) : (
                <><Scan className="h-4 w-4 mr-2" /> Run Full Discovery</>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => runDiscovery.mutate("yerevan-center")}
              disabled={runDiscovery.isPending}
            >
              Scan Yerevan Center Only
            </Button>
          </div>
          {runDiscovery.isPending && (
            <p className="text-xs text-muted-foreground mt-2">
              This may take a few minutes — scanning tiles, then AI-verifying each candidate...
            </p>
          )}
        </CardContent>
      </Card>

      {/* Flagged for review (suspicious) */}
      {needsReview.length > 0 && (
        <Card className="border-amber-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Flagged for Review ({needsReview.length})
            </CardTitle>
            <CardDescription>AI flagged these as suspicious — please verify manually</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {needsReview.map(c => renderCandidateCard(c, true))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legacy pending (before AI verification existed) */}
      {pending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              Pending Candidates ({pending.length})
            </CardTitle>
            <CardDescription>Older candidates awaiting verification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pending.map(c => renderCandidateCard(c, true))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Auto-approved summary */}
      {autoApprovedList.length > 0 && (
        <Card className="border-green-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-500" />
              Auto-Approved by AI ({autoApprovedList.length})
            </CardTitle>
            <CardDescription>AI verified and automatically added to the map</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Sport</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>AI Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {autoApprovedList.map(c => {
                  const meta = c.raw_metadata as any;
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{meta?.ai_suggested_name || meta?.name || "—"}</TableCell>
                      <TableCell className="capitalize">{c.detected_sport_type}</TableCell>
                      <TableCell>{getConfidenceBadge(Number(c.confidence_score))}</TableCell>
                      <TableCell className="text-xs">{meta?.address || `${c.latitude.toFixed(3)}, ${c.longitude.toFixed(3)}`}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{meta?.ai_reason || "—"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Processed candidates */}
      {processed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Manually Processed ({processed.length})</CardTitle>
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
                    <TableCell>{getStatusBadge(c.status)}</TableCell>
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
