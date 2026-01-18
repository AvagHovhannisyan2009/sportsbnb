import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
  secondaryHref?: string;
  tip?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  secondaryLabel,
  onSecondaryAction,
  secondaryHref,
  tip,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
      
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {actionLabel && (onAction || actionHref) && (
          actionHref ? (
            <Link to={actionHref}>
              <Button>{actionLabel}</Button>
            </Link>
          ) : (
            <Button onClick={onAction}>{actionLabel}</Button>
          )
        )}
        
        {secondaryLabel && (onSecondaryAction || secondaryHref) && (
          secondaryHref ? (
            <Link to={secondaryHref}>
              <Button variant="outline">{secondaryLabel}</Button>
            </Link>
          ) : (
            <Button variant="outline" onClick={onSecondaryAction}>{secondaryLabel}</Button>
          )
        )}
      </div>
      
      {tip && (
        <p className="text-xs text-muted-foreground mt-6 max-w-xs">
          💡 <span className="font-medium">Tip:</span> {tip}
        </p>
      )}
    </div>
  );
}

export default EmptyState;
