import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useCallback } from "react";

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string | null;
  message_text: string;
  message_type: "user" | "system";
  created_at: string;
  is_reported: boolean;
  sender?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  sender_role?: string;
}

// Fetch messages for a room with realtime subscription
export const useChatMessages = (roomId: string | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["venue-chat-messages", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("room_id", roomId!)
        .order("created_at", { ascending: true });

      if (error) throw error;
      
      // Fetch sender profiles separately
      const senderIds = [...new Set(data?.filter(m => m.sender_id).map(m => m.sender_id) || [])];
      let profiles: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
      let memberRoles: Record<string, string> = {};
      
      if (senderIds.length > 0) {
        const { data: profileData } = await supabase
          .from("profiles_public")
          .select("user_id, full_name, avatar_url")
          .in("user_id", senderIds);
        
        if (profileData) {
          profiles = profileData.reduce((acc, p) => {
            if (p.user_id) {
              acc[p.user_id] = { full_name: p.full_name, avatar_url: p.avatar_url };
            }
            return acc;
          }, {} as Record<string, { full_name: string | null; avatar_url: string | null }>);
        }

        const { data: membersData } = await supabase
          .from("chat_members")
          .select("user_id, role")
          .eq("room_id", roomId!);
        
        if (membersData) {
          memberRoles = membersData.reduce((acc, m) => {
            acc[m.user_id] = m.role;
            return acc;
          }, {} as Record<string, string>);
        }
      }

      return (data || []).map(msg => ({
        ...msg,
        sender: msg.sender_id ? profiles[msg.sender_id] : undefined,
        sender_role: msg.sender_id ? memberRoles[msg.sender_id] : undefined,
      })) as ChatMessage[];
    },
    enabled: !!roomId,
  });

  // Subscribe to realtime changes
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`venue-chat-messages-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const newMessage = payload.new as ChatMessage;
          let sender = undefined;
          let sender_role = undefined;
          
          if (newMessage.sender_id) {
            const { data: profile } = await supabase
              .from("profiles_public")
              .select("full_name, avatar_url")
              .eq("user_id", newMessage.sender_id)
              .maybeSingle();
            
            if (profile) {
              sender = profile;
            }

            const { data: memberData } = await supabase
              .from("chat_members")
              .select("role")
              .eq("room_id", roomId)
              .eq("user_id", newMessage.sender_id)
              .maybeSingle();
            
            if (memberData) {
              sender_role = memberData.role;
            }
          }

          queryClient.setQueryData(["venue-chat-messages", roomId], (old: ChatMessage[] | undefined) => {
            if (!old) return [{ ...newMessage, sender, sender_role }];
            if (old.some(m => m.id === newMessage.id)) return old;
            return [...old, { ...newMessage, sender, sender_role }];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, queryClient]);

  return query;
};

// Send a message
export const useSendMessage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, message }: { roomId: string; message: string }) => {
      const { data, error } = await supabase
        .from("chat_messages")
        .insert({
          room_id: roomId,
          sender_id: user?.id,
          message_text: message,
          message_type: "user",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: ["venue-chat-messages", roomId] });
    },
  });
};

// Report a message
export const useReportMessage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, roomId }: { messageId: string; roomId: string }) => {
      const { error } = await supabase
        .from("chat_messages")
        .update({
          is_reported: true,
          reported_by: user?.id,
          reported_at: new Date().toISOString(),
        })
        .eq("id", messageId);

      if (error) throw error;
    },
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: ["venue-chat-messages", roomId] });
    },
  });
};

// Update last read timestamp
export const useUpdateLastRead = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: string) => {
      const { error } = await supabase
        .from("chat_members")
        .update({ last_read_at: new Date().toISOString() })
        .eq("room_id", roomId)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unread-messages"] });
    },
  });
};

// Block a user
export const useBlockUser = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ roomId, blockedId, reason }: { roomId: string; blockedId: string; reason?: string }) => {
      const { error } = await supabase
        .from("blocked_users")
        .insert({
          blocker_id: user?.id,
          blocked_id: blockedId,
          room_id: roomId,
          reason,
        });

      if (error) throw error;
    },
  });
};

// Initialize venue chat
export const useInitializeVenueChat = () => {
  const queryClient = useQueryClient();

  const initializeVenueChat = useCallback(async (
    venueId: string,
    userId: string,
    ownerId: string,
    venueName?: string
  ) => {
    try {
      // Get or create the room
      const { data: roomId, error: roomError } = await supabase.rpc("get_or_create_chat_room", {
        p_type: "venue",
        p_reference_id: venueId,
      });

      if (roomError) throw roomError;

      // Add user as member
      await supabase.rpc("add_chat_member", {
        p_room_id: roomId,
        p_user_id: userId,
        p_role: "customer",
      });

      // Add owner as member
      await supabase.rpc("add_chat_member", {
        p_room_id: roomId,
        p_user_id: ownerId,
        p_role: "owner",
      });

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["user-chat-rooms"] });

      return roomId as string;
    } catch (error) {
      console.error("Error initializing venue chat:", error);
      throw error;
    }
  }, [queryClient]);

  return { initializeVenueChat, isLoading: false };
};

// Fetch owner reply templates
export const useOwnerReplyTemplates = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["owner-reply-templates", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("owner_reply_templates")
        .select("*")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
};

// Create reply template
export const useCreateReplyTemplate = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, messageText }: { title: string; messageText: string }) => {
      const { data, error } = await supabase
        .from("owner_reply_templates")
        .insert({
          owner_id: user?.id,
          title,
          message_text: messageText,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-reply-templates"] });
    },
  });
};

// Delete reply template
export const useDeleteReplyTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from("owner_reply_templates")
        .delete()
        .eq("id", templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-reply-templates"] });
    },
  });
};
