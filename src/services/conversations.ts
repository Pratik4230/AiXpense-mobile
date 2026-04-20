import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  IMessage,
  ConversationSummary,
  ConversationFull,
} from "@/types/conversation";

async function fetchConversations(): Promise<ConversationSummary[]> {
  const res = await api.get<{ conversations: ConversationSummary[] }>(
    "/api/conversations",
  );
  return res.data.conversations;
}

async function fetchConversation(id: string): Promise<ConversationFull> {
  const res = await api.get<{ conversation: ConversationFull }>(
    `/api/conversations/${id}`,
  );
  return res.data.conversation;
}

async function createConversation(
  title?: string,
): Promise<ConversationSummary> {
  const res = await api.post<{ conversation: ConversationSummary }>(
    "/api/conversations",
    { title },
  );
  return res.data.conversation;
}

async function updateConversation(params: {
  id: string;
  title?: string;
  messages?: IMessage[];
}): Promise<ConversationSummary> {
  const res = await api.patch<{ conversation: ConversationSummary }>(
    `/api/conversations/${params.id}`,
    {
      title: params.title,
      messages: params.messages,
    },
  );
  return res.data.conversation;
}

async function deleteConversation(id: string): Promise<void> {
  await api.delete(`/api/conversations/${id}`);
}

export function useConversations(enabled = true) {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useConversation(id: string | null, enabled = true) {
  return useQuery({
    queryKey: ["conversation", id],
    queryFn: () => fetchConversation(id!),
    enabled: enabled && !!id,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

async function appendConversationMessages(params: {
  id: string;
  appendMessages: IMessage[];
}): Promise<ConversationSummary> {
  const res = await api.patch<{ conversation: ConversationSummary }>(
    `/api/conversations/${params.id}`,
    { appendMessages: params.appendMessages },
  );
  return res.data.conversation;
}

export function useUpdateConversation() {
  return useMutation({
    mutationFn: updateConversation,
  });
}

export function useAppendMessages() {
  return useMutation({
    mutationFn: appendConversationMessages,
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
