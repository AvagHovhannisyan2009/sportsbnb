import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { VenueChatDialog } from "./VenueChatDialog";

interface VenueChatButtonProps {
  venueId: string;
  venueName: string;
  ownerId: string;
}

export const VenueChatButton = ({ venueId, venueName, ownerId }: VenueChatButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Don't show button if user is the owner
  if (user?.id === ownerId) {
    return null;
  }

  const handleClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setIsOpen(true);
  };

  return (
    <>
      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={handleClick}
      >
        <MessageCircle className="h-4 w-4" />
        Message owner
      </Button>

      {user && (
        <VenueChatDialog
          open={isOpen}
          onOpenChange={setIsOpen}
          venueId={venueId}
          venueName={venueName}
          ownerId={ownerId}
        />
      )}
    </>
  );
};
