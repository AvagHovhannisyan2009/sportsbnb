import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  useChatMessages,
  useSendMessage,
  useReportMessage,
  useUpdateLastRead,
} from "@/hooks/useChat";
import { ChatBubble } from "./ChatBubble";
import { ChatInput } from "./ChatInput";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface ChatRoomProps {
  roomId: string;
  title?: string;
}

export const ChatRoom = ({ roomId, title }: ChatRoomProps) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useChatMessages(roomId);
  const sendMessage = useSendMessage();
  const reportMessage = useReportMessage();
  const updateLastRead = useUpdateLastRead();

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messages && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Update last read when viewing chat
  useEffect(() => {
    if (roomId && user?.id) {
      updateLastRead.mutate(roomId);
    }
  }, [roomId, user?.id, messages?.length]);

  const handleSend = (message: string) => {
    sendMessage.mutate(
      { roomId, message },
      {
        onError: () => {
          toast.error("Failed to send message");
        },
      }
    );
  };

  const handleReport = (messageId: string) => {
    reportMessage.mutate(
      { messageId, roomId },
      {
        onSuccess: () => {
          toast.success("Message reported");
        },
        onError: () => {
          toast.error("Failed to report message");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`flex gap-2 ${i % 2 === 0 ? "" : "justify-end"}`}>
              {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
              <Skeleton className="h-12 w-48 rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {title && (
        <div className="px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <h3 className="font-semibold">{title}</h3>
        </div>
      )}

      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageSquare className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs">Start the conversation!</p>
          </div>
        ) : (
          messages?.map((message) => (
            <ChatBubble
              key={message.id}
              message={message}
              isOwn={message.sender_id === user?.id}
              onReport={handleReport}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={handleSend} disabled={sendMessage.isPending} />
    </div>
  );
};
