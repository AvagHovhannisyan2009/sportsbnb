import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { ChatDialog } from "./ChatDialog";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface ChatButtonProps {
  type: "game" | "booking";
  referenceId: string;
  title: string;
  userRole?: "host" | "player" | "owner" | "customer";
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showLabel?: boolean;
}

export const ChatButton = ({
  type,
  referenceId,
  title,
  userRole = "player",
  variant = "outline",
  size = "default",
  className,
  showLabel = true,
}: ChatButtonProps) => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  if (!user) return null;

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={cn("gap-2", className)}
        onClick={() => setOpen(true)}
      >
        <MessageCircle className="h-4 w-4" />
        {showLabel && "Chat"}
      </Button>

      <ChatDialog
        open={open}
        onOpenChange={setOpen}
        type={type}
        referenceId={referenceId}
        title={title}
        userRole={userRole}
      />
    </>
  );
};
