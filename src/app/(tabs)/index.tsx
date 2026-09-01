import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  useColorScheme,
  Platform,
  AppState,
  Alert,
} from "react-native";
import * as Linking from "expo-linking";
import * as Haptics from "expo-haptics";
import { useThemeColor } from "heroui-native";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { fetch as expoFetch } from "expo/fetch";
import { SafeAreaView } from "@/components/ui";
import { authClient, useSession } from "@/lib/authClient";
import { generateAPIUrl } from "@/utils/api";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { TrialStatus } from "@/components/chat/TrialStatus";
import { ChatEmptyState } from "@/components/chat/ChatEmptyState";
import { useReceiptCapture } from "@/hooks/useReceiptCapture";
import { useShareIntentReceipt } from "@/hooks/useShareIntentReceipt";
import {
  useOfflineQueue,
  useOfflineQueueFlusher,
} from "@/hooks/useOfflineQueue";
import { OfflineBanner } from "@/components/chat/OfflineBanner";
import {
  bindOfflineJobsToConversation,
  offlineJobsToPendingMessages,
} from "@/lib/offlineQueue";
import { ComposerKeyboardOrSticky } from "@/components/chat/ComposerKeyboardOrSticky";
import {
  TransactionAttachment,
  type SelectedTransaction,
} from "@/components/chat/TransactionAttachment";
import { createDrawerNavigator } from "expo-router/build/react-navigation/drawer";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { Feather } from "@expo/vector-icons";
import {
  useConversation,
  useCreateConversation,
  useAppendMessages,
} from "@/services/conversations";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import {
  FREE_LIFETIME_LIMIT,
  TRIAL_LIMIT_ERROR_MESSAGE,
  TRIALS_QUERY_KEY,
  isTrialLimitError,
  useTrials,
  useTrialActions,
} from "@/services/trials";
import { webApiBase } from "@/lib/env";
import { parseChatErrorMessage } from "@/lib/aiErrors";

function ChatSessionLoader({
  conversationId,
  shouldFetchConversation,
  onOpenDrawer,
  onConversationCreated,
}: {
  conversationId: string | null;
  shouldFetchConversation: boolean;
  onOpenDrawer: () => void;
  onConversationCreated: (id: string) => void;
}) {
  const { data: conversationData, isLoading } = useConversation(
    conversationId,
    shouldFetchConversation,
  );
  const [accentColor] = useThemeColor(["accent"]);

  if (conversationId && shouldFetchConversation && isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color={accentColor} />
      </SafeAreaView>
    );
  }

  return (
    <ChatSession
      conversationId={conversationId}
      initialMessages={
        shouldFetchConversation ? conversationData?.messages || [] : []
      }
      onOpenDrawer={onOpenDrawer}
      onConversationCreated={onConversationCreated}
    />
  );
}

function ChatSession({
  conversationId,
  initialMessages,
  onOpenDrawer,
  onConversationCreated,
}: {
  conversationId: string | null;
  initialMessages: any[];
  onOpenDrawer: () => void;
  onConversationCreated: (id: string) => void;
}) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { data: trialsData, isFetching: isTrialsFetching } = useTrials(
    !!session?.user,
  );
  const { optimisticDecrement, invalidateTrials, markTrialsExhausted } =
    useTrialActions();

  const isPremium = trialsData?.isPremium ?? false;
  const displayTrials = trialsData?.freeTrials ?? 0;

  const showUpgradeAlert = useCallback(() => {
    Alert.alert(
      "Upgrade to Premium",
      `You've used all ${FREE_LIFETIME_LIMIT} free AI messages. Upgrade for unlimited access.`,
      [
        { text: "Not now", style: "cancel" },
        {
          text: "View plans",
          onPress: () => void Linking.openURL(`${webApiBase()}/premium`),
        },
      ],
    );
  }, []);

  const canUseTrialMessage = useCallback(() => {
    if (isPremium) return true;
    if (isTrialsFetching) return false;
    if (displayTrials <= 0) {
      showUpgradeAlert();
      return false;
    }
    return true;
  }, [isPremium, isTrialsFetching, displayTrials, showUpgradeAlert]);

  const consumeTrial = useCallback(() => {
    if (!isPremium) optimisticDecrement();
  }, [isPremium, optimisticDecrement]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active") {
        void queryClient.invalidateQueries({ queryKey: TRIALS_QUERY_KEY });
      }
    });
    return () => sub.remove();
  }, [queryClient]);

  const [input, setInput] = useState("");
  const [selectedTransaction, setSelectedTransaction] =
    useState<SelectedTransaction | null>(null);

  const insets = useSafeAreaInsets();
  // Do not apply top padding on SafeAreaView — we position once with insets here.
  // Otherwise SafeAreaView + insets.top stacks and leaves a large empty band.
  const menuTop = insets.top + 8;
  // `edges` includes `left`; padding already accounts for cutouts — offset inside content.
  const menuLeft = 12;
  const menuRight = 12;
  const belowTopChrome = menuTop + 44;

  const createConversation = useCreateConversation();
  const appendMessages = useAppendMessages();
  
  const conversationIdRef = useRef(conversationId);
  
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  const cookies = authClient.getCookie();
  const chatHeaders = useMemo(() => {
    const h: Record<string, string> = {};
    if (cookies) h.Cookie = cookies;
    return h;
  }, [cookies]);

  const lastSavedCountRef = useRef(initialMessages.length);
  const pendingSaveRef = useRef(false);
  const pendingReceiptPromptRef = useRef<string | null>(null);

  const chatDoneResolverRef = useRef<(() => void) | null>(null);
  const chatDoneRejectRef = useRef<((err: Error) => void) | null>(null);
  const chatWaitSawBusyRef = useRef(false);

  const userId = session?.user?.id as string | undefined;
  const {
    isOnline,
    jobsForConversation,
    enqueueChat,
    enqueueVoice,
    enqueueReceipt,
    retryJob,
    queueVersion,
  } = useOfflineQueue(userId);

  const pendingJobs = jobsForConversation(conversationId);
  void queueVersion;

  const { messages, sendMessage, status, error } = useChat({
    messages: initialMessages as any,
    transport: new DefaultChatTransport({
      api: generateAPIUrl("/api/chat"),
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      headers: chatHeaders,
    }),
    onError: (err) => {
      console.error("Chat error:", err);
      if (chatDoneRejectRef.current) {
        chatDoneRejectRef.current(
          err instanceof Error ? err : new Error(String(err)),
        );
        chatDoneResolverRef.current = null;
        chatDoneRejectRef.current = null;
      }
      if (isTrialLimitError(err.message)) {
        markTrialsExhausted();
        void invalidateTrials();
        showUpgradeAlert();
      }
    },
  });

  const isStreaming = status === "streaming";
  const isChatIdle = status === "ready" || status === "error";
  const prevStatusRef = useRef(status);

  const waitForChatTurn = useCallback(() => {
    chatWaitSawBusyRef.current = false;
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        chatDoneResolverRef.current = null;
        chatDoneRejectRef.current = null;
        chatWaitSawBusyRef.current = false;
        reject(new Error("Chat sync timed out"));
      }, 60_000);

      chatDoneResolverRef.current = () => {
        clearTimeout(timeout);
        chatWaitSawBusyRef.current = false;
        resolve();
      };
      chatDoneRejectRef.current = (err) => {
        clearTimeout(timeout);
        chatWaitSawBusyRef.current = false;
        reject(err);
      };
    });
  }, []);

  const sendChatTextAndWait = useCallback(
    async (text: string) => {
      const wait = waitForChatTurn();
      sendMessage({ text });
      await wait;
    },
    [sendMessage, waitForChatTurn],
  );

  const sendReceiptAndWait = useCallback(
    async (args: { text: string; url: string; mediaType: string }) => {
      const wait = waitForChatTurn();
      sendMessage({
        role: "user",
        parts: [
          { type: "text", text: args.text },
          { type: "file", mediaType: args.mediaType, url: args.url },
        ],
      } as any);
      await wait;
    },
    [sendMessage, waitForChatTurn],
  );

  const flushHandlers = useMemo(
    () => ({
      sendChatText: sendChatTextAndWait,
      sendReceipt: sendReceiptAndWait,
      consumeTrial,
      canUseTrialMessage,
    }),
    [
      sendChatTextAndWait,
      sendReceiptAndWait,
      consumeTrial,
      canUseTrialMessage,
    ],
  );

  const { flushError } = useOfflineQueueFlusher(
    userId,
    conversationId,
    isChatIdle && !isStreaming,
    flushHandlers,
  );

  useEffect(() => {
    if (conversationId && userId) {
      bindOfflineJobsToConversation(userId, conversationId);
    }
  }, [conversationId, userId]);

  useEffect(() => {
    if (!chatDoneResolverRef.current && !chatDoneRejectRef.current) {
      return;
    }

    if (status === "submitted" || status === "streaming") {
      chatWaitSawBusyRef.current = true;
    }

    if (status === "error") {
      chatDoneRejectRef.current?.(new Error("Chat request failed"));
      chatDoneResolverRef.current = null;
      chatDoneRejectRef.current = null;
      return;
    }

    if (status === "ready" && chatWaitSawBusyRef.current) {
      if (!isPremium) invalidateTrials();
      chatDoneResolverRef.current?.();
      chatDoneResolverRef.current = null;
      chatDoneRejectRef.current = null;
    }
  }, [status, isPremium, invalidateTrials]);

  // Saving messages logic ported from web ChatView
  const saveMessages = useCallback(
    async (currentMessages: any[]) => {
      if (currentMessages.length === 0 || pendingSaveRef.current) return;
      pendingSaveRef.current = true;

      try {
        const currentConvId = conversationIdRef.current;
        if (currentConvId) {
          const newMessages = currentMessages
            .slice(lastSavedCountRef.current)
            .map((msg) => ({
              id: msg.id,
              role: msg.role as "user" | "assistant",
              parts: msg.parts,
              createdAt: new Date(),
            }));

          if (newMessages.length > 0) {
            await appendMessages.mutateAsync({
              id: currentConvId,
              appendMessages: newMessages as any,
            });
            lastSavedCountRef.current = currentMessages.length;
          }
        } else {
          // New conversation
          const messagesToSave = currentMessages.map((msg) => ({
            id: msg.id,
            role: msg.role as "user" | "assistant",
            parts: msg.parts,
            createdAt: new Date(),
          }));

          const firstUserMessage = currentMessages.find(
            (m) => m.role === "user",
          );
          let title = "New Conversation";
          if (firstUserMessage?.parts) {
            const textPart = (
              firstUserMessage.parts as { type: string; text?: string }[]
            ).find((p) => p.type === "text");
            if (textPart?.text) {
              title = textPart.text.slice(0, 50);
              if (title.includes("[ATTACHED_TRANSACTION:")) {
                const itemMatch = title.match(/item=([^,\]]+)/);
                title = itemMatch
                  ? `Transaction: ${itemMatch[1]}`
                  : "Transaction Edit";
              }
            }
          }

          const newConv = await createConversation.mutateAsync(title);
          conversationIdRef.current = newConv._id;
          onConversationCreated(newConv._id);
          await appendMessages.mutateAsync({
            id: newConv._id,
            appendMessages: messagesToSave as any,
          });
          lastSavedCountRef.current = currentMessages.length;
        }
      } catch (err) {
        console.error("Failed to save messages", err);
      } finally {
        pendingSaveRef.current = false;
      }
    },
    [createConversation, appendMessages, onConversationCreated],
  );

  // Persist conversation when a stream finishes.
  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;

    if (prev !== "streaming" || status !== "ready") return;

    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role !== "assistant") return;

    void saveMessages(messages);
  }, [status, messages, saveMessages]);

  const outdatedIds = useMemo(() => {
    const map = new Map<string, string>();
    for (const msg of messages as any[]) {
      if (msg?.role !== "assistant") continue;
      for (const part of msg.parts ?? []) {
        const p = part as any;
        if (
          p.type === "tool-deleteTransaction" &&
          p.state === "output-available" &&
          p.output?.success &&
          p.output.deleted?.id
        ) {
          map.set(p.output.deleted.id, msg.id);
        }
        if (
          p.type === "tool-updateTransaction" &&
          p.state === "output-available" &&
          p.output?.success &&
          p.output.transaction?.id
        ) {
          map.set(p.output.transaction.id, msg.id);
        }
      }
    }
    return map;
  }, [messages]);

  const handleReceiptUploaded = useCallback(
    (file: { url: string; mediaType: string }) => {
      if (isStreaming || !canUseTrialMessage()) return;
      consumeTrial();
      const text =
        input.trim() ||
        pendingReceiptPromptRef.current ||
        "Scan this bill";
      pendingReceiptPromptRef.current = null;
      sendMessage({
        role: "user",
        parts: [
          { type: "text", text },
          { type: "file", mediaType: file.mediaType, url: file.url },
        ],
      } as any);
      setInput("");
    },
    [
      isStreaming,
      canUseTrialMessage,
      consumeTrial,
      input,
      sendMessage,
    ],
  );

  const handleReceiptQueued = useCallback(
    (file: { uri: string; fileName: string; mimeType: string }) => {
      const text =
        input.trim() ||
        pendingReceiptPromptRef.current ||
        "Scan this bill";
      pendingReceiptPromptRef.current = null;
      void enqueueReceipt({
        sourceUri: file.uri,
        fileName: file.fileName,
        mimeType: file.mimeType,
        text,
        conversationId: conversationIdRef.current,
      });
      setInput("");
    },
    [input, enqueueReceipt],
  );

  const { startReceiptCapture, uploading: receiptUploading } = useReceiptCapture({
    isPremium,
    isOnline,
    disabled:
      isStreaming || isTrialsFetching || !!selectedTransaction,
    onUploaded: handleReceiptUploaded,
    onQueued: handleReceiptQueued,
    onCaptureDismissed: () => {
      pendingReceiptPromptRef.current = null;
    },
  });

  useShareIntentReceipt({
    enabled: true,
    isOnline,
    disabled:
      isStreaming || isTrialsFetching || receiptUploading || !!selectedTransaction,
    onUploaded: handleReceiptUploaded,
    onQueued: handleReceiptQueued,
  });

  const handleScanBillPress = useCallback(
    (suggestion: string) => {
      if (isStreaming || isTrialsFetching || receiptUploading) return;
      pendingReceiptPromptRef.current = suggestion;
      startReceiptCapture();
    },
    [isStreaming, isTrialsFetching, receiptUploading, startReceiptCapture],
  );

  const attachedPrefix = (tx: SelectedTransaction) => {
    const cur =
      tx.currency != null && tx.currency !== ""
        ? `, currency=${tx.currency}`
        : "";
    return `[ATTACHED_TRANSACTION: id=${tx.id}, type=${tx.type}, item=${tx.item}, amount=${tx.amount}, action=${tx.action}${cur}]`;
  };

  const queueOrSendText = (text: string) => {
    if (!isOnline) {
      enqueueChat({
        text,
        conversationId: conversationIdRef.current,
      });
      return;
    }
    consumeTrial();
    sendMessage({ text });
  };

  const handleSend = () => {
    if (isStreaming || !canUseTrialMessage()) return;

    if (selectedTransaction) {
      const prefix = attachedPrefix(selectedTransaction);

      if (selectedTransaction.action === "delete") {
        queueOrSendText(prefix);
        setSelectedTransaction(null);
        setInput("");
        return;
      }

      const text = input.trim();
      if (!text) return;
      queueOrSendText(`${prefix} ${text}`);
      setInput("");
      setSelectedTransaction(null);
      return;
    }

    const text = input.trim();
    if (!text) return;
    queueOrSendText(text);
    setInput("");
  };

  /** Same routing as `handleSend`, but with explicit text (voice STT). */
  const handleVoiceTranscript = (transcript: string) => {
    const trimmed = transcript.trim();
    if (!trimmed || isStreaming || !canUseTrialMessage()) return;

    if (selectedTransaction) {
      if (selectedTransaction.action === "delete") return;
      queueOrSendText(`${attachedPrefix(selectedTransaction)} ${trimmed}`);
      setInput("");
      setSelectedTransaction(null);
      return;
    }

    queueOrSendText(trimmed);
    setInput("");
  };

  const handleOfflineVoice = (args: { uri: string; fileName: string }) => {
    if (!canUseTrialMessage()) return;
    void enqueueVoice({
      sourceUri: args.uri,
      fileName: args.fileName,
      conversationId: conversationIdRef.current,
    });
  };

  const handleSuggestion = (suggestion: string) => {
    if (isStreaming || !canUseTrialMessage()) return;
    queueOrSendText(suggestion);
  };

  const handlePendingPress = useCallback(
    (jobId: string, pendingStatus: "queued" | "syncing" | "failed") => {
      if (pendingStatus === "failed") {
        retryJob(jobId);
      }
    },
    [retryJob],
  );

  const displayMessages = useMemo(() => {
    const pending = offlineJobsToPendingMessages(pendingJobs);
    return [...(messages as any[]), ...pending];
  }, [messages, pendingJobs]);

  const pendingCount = pendingJobs.length;
  const isSyncingPending = pendingJobs.some((j) => j.status === "syncing");

  const handleEdit = (
    id: string,
    type: "expense" | "income",
    item: string,
    amount: number,
    currency?: string,
  ) => {
    setSelectedTransaction({ id, type, item, amount, currency, action: "edit" });
  };

  const handleDelete = (
    id: string,
    type: "expense" | "income",
    item: string,
    amount: number,
    currency?: string,
  ) => {
    setSelectedTransaction({ id, type, item, amount, currency, action: "delete" });
  };

  const [accentColor] = useThemeColor(["accent"]);

  return (
    <SafeAreaView
      edges={["left", "right"]}
      className="flex-1 bg-background relative"
    >
      <Pressable
        onPress={() => {
          void Haptics.selectionAsync();
          onOpenDrawer();
        }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        className="absolute z-50 rounded-2xl border border-separator bg-surface p-2.5 active:opacity-90"
        style={[
          { top: menuTop, left: menuLeft },
          Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
            },
            android: { elevation: 3 },
          }),
        ]}
      >
        <Feather name="menu" size={20} color={accentColor} />
      </Pressable>

      <View
        className="absolute z-50"
        style={{ top: menuTop, right: menuRight }}
      >
        {isTrialsFetching && !trialsData ? (
          <ActivityIndicator size="small" color={accentColor} />
        ) : (
          <TrialStatus
            isPremium={isPremium}
            freeTrials={displayTrials}
            onPress={
              isPremium
                ? undefined
                : () => void Linking.openURL(`${webApiBase()}/premium`)
            }
          />
        )}
      </View>

      {error && isTrialLimitError(error.message) ? (
        <View
          className="mx-4 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3"
          style={{ marginTop: belowTopChrome }}
        >
          <Text className="text-sm font-medium text-danger leading-snug">
            {TRIAL_LIMIT_ERROR_MESSAGE}
          </Text>
        </View>
      ) : error ? (
        <View
          className="mx-4 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3"
          style={{ marginTop: belowTopChrome }}
        >
          <Text className="text-sm font-medium text-danger leading-snug">
            {parseChatErrorMessage(error.message)}
          </Text>
        </View>
      ) : flushError && isOnline ? (
        <View
          className="mx-4 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3"
          style={{ marginTop: belowTopChrome }}
        >
          <Text className="text-sm font-medium text-danger leading-snug">
            Sync failed: {flushError}
          </Text>
        </View>
      ) : null}

      <View
        className="flex-1"
        style={{
          paddingTop: error || (flushError && isOnline) ? 8 : belowTopChrome,
        }}
      >
        <OfflineBanner
          pendingCount={pendingCount}
          isOnline={isOnline}
          syncing={isSyncingPending}
          onRetryAll={() => {
            for (const j of pendingJobs) {
              if (j.status === "failed") retryJob(j.id);
            }
          }}
        />
        {displayMessages.length === 0 ? (
          <ChatEmptyState
            onSuggestionPress={handleSuggestion}
            onScanBillPress={handleScanBillPress}
            disabled={isStreaming || isTrialsFetching || receiptUploading}
          />
        ) : (
          <MessageList
            messages={displayMessages as any}
            isStreaming={isStreaming}
            onEdit={handleEdit}
            onDelete={handleDelete}
            outdatedIds={outdatedIds}
            onPendingPress={handlePendingPress}
          />
        )}
      </View>

      <ComposerKeyboardOrSticky>
        {selectedTransaction && (
          <TransactionAttachment
            transaction={selectedTransaction}
            onRemove={() => setSelectedTransaction(null)}
          />
        )}
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          isLoading={isStreaming || isTrialsFetching}
          selectedTransaction={selectedTransaction}
          isPremium={isPremium}
          isOnline={isOnline}
          onVoiceTranscript={handleVoiceTranscript}
          onOfflineVoice={handleOfflineVoice}
          startReceiptCapture={startReceiptCapture}
          receiptUploading={receiptUploading}
        />
      </ComposerKeyboardOrSticky>
    </SafeAreaView>
  );
}

const Drawer = createDrawerNavigator();

export default function HomeScreen() {
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [chatSessionKey, setChatSessionKey] = useState(0);
  const [shouldFetchConversation, setShouldFetchConversation] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const drawerScreenOptions = useMemo(
    () => ({
      headerShown: false as const,
      drawerStyle: {
        width: "86%" as const,
        maxWidth: 320,
        backgroundColor: "transparent" as const,
        borderRightWidth: 0,
      },
      overlayColor: isDark
        ? "rgba(0,0,0,0.55)"
        : "rgba(15, 23, 42, 0.32)",
      swipeEdgeWidth: 48,
    }),
    [isDark],
  );

  const handleDrawerSelect = (id: string | null, navigation: any) => {
    setCurrentConversationId(id);
    setShouldFetchConversation(!!id);
    // Force a fresh ChatSession when the user explicitly switches sessions
    // via the sidebar (including "New chat"). Do NOT bump this key when the
    // session id is created after the first message; that would remount and
    // feel like a reload.
    setChatSessionKey((k) => k + 1);
    navigation.closeDrawer();
  };

  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <ConversationSidebar
          currentId={currentConversationId}
          onSelect={(id) => handleDrawerSelect(id, props.navigation)}
          onClose={() => props.navigation.closeDrawer()}
        />
      )}
      screenOptions={drawerScreenOptions}
    >
      <Drawer.Screen name="ChatSession">
        {(props) => (
          <ChatSessionLoader
            key={chatSessionKey}
            conversationId={currentConversationId}
            onOpenDrawer={() => props.navigation.openDrawer()}
            shouldFetchConversation={shouldFetchConversation}
            onConversationCreated={(id) => {
              setCurrentConversationId(id);
              setShouldFetchConversation(false);
            }}
          />
        )}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}
