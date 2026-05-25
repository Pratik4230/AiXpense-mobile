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
  FREE_DAILY_LIMIT,
  TRIAL_LIMIT_ERROR_MESSAGE,
  TRIALS_QUERY_KEY,
  isTrialLimitError,
  useTrials,
  useTrialActions,
} from "@/services/trials";
import { webApiBase } from "@/lib/env";

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
      `You've used all ${FREE_DAILY_LIMIT} free AI messages for today. They reset at midnight IST. Upgrade for unlimited access.`,
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
  const [outdatedIds, setOutdatedIds] = useState<Map<string, string>>(
    new Map(),
  );

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

  const { messages, sendMessage, status, error } = useChat({
    messages: initialMessages as any,
    transport: new DefaultChatTransport({
      api: generateAPIUrl("/api/chat"),
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      headers: chatHeaders,
    }),
    onError: (err) => {
      console.error("Chat error:", err);
      if (isTrialLimitError(err.message)) {
        markTrialsExhausted();
        void invalidateTrials();
        showUpgradeAlert();
      }
    },
  });

  const isStreaming = status === "streaming";
  const prevStatusRef = useRef(status);

  const wasStreamingRef = useRef(false);
  useEffect(() => {
    if (wasStreamingRef.current && status === "ready") {
      if (!isPremium) invalidateTrials();
    }
    wasStreamingRef.current = status === "streaming";
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

  if (prevStatusRef.current === "streaming" && status === "ready") {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === "assistant") {
      saveMessages(messages);

      for (const part of lastMsg.parts ?? []) {
        const p = part as any;
        if (
          p.type === "tool-deleteTransaction" &&
          p.state === "output-available" &&
          p.output?.success &&
          p.output.deleted?.id
        ) {
          setOutdatedIds((prev) =>
            new Map(prev).set(p.output.deleted.id, lastMsg.id),
          );
        }
        if (
          p.type === "tool-updateTransaction" &&
          p.state === "output-available" &&
          p.output?.success &&
          p.output.transaction?.id
        ) {
          setOutdatedIds((prev) =>
            new Map(prev).set(p.output.transaction.id, lastMsg.id),
          );
        }
      }
    }
  }
  prevStatusRef.current = status;

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

  const { startReceiptCapture, uploading: receiptUploading } = useReceiptCapture({
    isPremium,
    disabled:
      isStreaming || isTrialsFetching || !!selectedTransaction,
    onUploaded: handleReceiptUploaded,
    onCaptureDismissed: () => {
      pendingReceiptPromptRef.current = null;
    },
  });

  const handleScanBillPress = useCallback(
    (suggestion: string) => {
      if (isStreaming || isTrialsFetching || receiptUploading) return;
      pendingReceiptPromptRef.current = suggestion;
      startReceiptCapture();
    },
    [isStreaming, isTrialsFetching, receiptUploading, startReceiptCapture],
  );

  const handleSend = () => {
    if (isStreaming || !canUseTrialMessage()) return;

    if (selectedTransaction) {
      const cur =
        selectedTransaction.currency != null && selectedTransaction.currency !== ""
          ? `, currency=${selectedTransaction.currency}`
          : "";
      const prefix = `[ATTACHED_TRANSACTION: id=${selectedTransaction.id}, type=${selectedTransaction.type}, item=${selectedTransaction.item}, amount=${selectedTransaction.amount}, action=${selectedTransaction.action}${cur}]`;

      if (selectedTransaction.action === "delete") {
        consumeTrial();
        sendMessage({ text: prefix });
        setSelectedTransaction(null);
        setInput("");
        return;
      }

      const text = input.trim();
      if (!text) return;
      consumeTrial();
      sendMessage({ text: `${prefix} ${text}` });
      setInput("");
      setSelectedTransaction(null);
      return;
    }

    const text = input.trim();
    if (!text) return;
    consumeTrial();
    sendMessage({ text });
    setInput("");
  };

  /** Same routing as `handleSend`, but with explicit text (voice STT). */
  const handleVoiceTranscript = (transcript: string) => {
    const trimmed = transcript.trim();
    if (!trimmed || isStreaming || !canUseTrialMessage()) return;

    if (selectedTransaction) {
      const cur =
        selectedTransaction.currency != null && selectedTransaction.currency !== ""
          ? `, currency=${selectedTransaction.currency}`
          : "";
      const prefix = `[ATTACHED_TRANSACTION: id=${selectedTransaction.id}, type=${selectedTransaction.type}, item=${selectedTransaction.item}, amount=${selectedTransaction.amount}, action=${selectedTransaction.action}${cur}]`;
      if (selectedTransaction.action === "delete") return;
      consumeTrial();
      sendMessage({ text: `${prefix} ${trimmed}` });
      setInput("");
      setSelectedTransaction(null);
      return;
    }

    consumeTrial();
    sendMessage({ text: trimmed });
    setInput("");
  };

  const handleSuggestion = (suggestion: string) => {
    if (isStreaming || !canUseTrialMessage()) return;
    consumeTrial();
    sendMessage({ text: suggestion });
  };

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
            Something went wrong. Try again.
          </Text>
        </View>
      ) : null}

      <View className="flex-1" style={{ paddingTop: belowTopChrome }}>
        {messages.length === 0 ? (
          <ChatEmptyState
            onSuggestionPress={handleSuggestion}
            onScanBillPress={handleScanBillPress}
            disabled={isStreaming || isTrialsFetching || receiptUploading}
          />
        ) : (
          <MessageList
            messages={messages as any}
            isStreaming={isStreaming}
            onEdit={handleEdit}
            onDelete={handleDelete}
            outdatedIds={outdatedIds}
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
          onVoiceTranscript={handleVoiceTranscript}
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
