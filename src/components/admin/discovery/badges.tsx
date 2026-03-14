import React from "react";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertTriangle } from "lucide-react";

export const getConfidenceBadge = (score: number) => {
  if (score >= 0.85) return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">{(score * 100).toFixed(0)}%</Badge>;
  if (score >= 0.7) return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">{(score * 100).toFixed(0)}%</Badge>;
  return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">{(score * 100).toFixed(0)}%</Badge>;
};

export const getStatusBadge = (status: string) => {
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
