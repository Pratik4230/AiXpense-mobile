import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  useColorScheme,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useThemeColor } from "heroui-native";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { fetch as expoFetch } from "expo/fetch";
import {
  KeyboardStickyView,
  useReanimatedKeyboardAnimation,
} from "react-native-keyboard-controller";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { SafeAreaView } from "@/components/ui";
import { authClient, useSession } from "@/lib/authClient";
import { generateAPIUrl } from "@/utils/api";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatEmptyState } from "@/components/chat/ChatEmptyState";
import {
  TransactionAttachment,
  type SelectedTransaction,
} from "@/components/chat/TransactionAttachment";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { Feather } from "@expo/vector-icons";
import {
  useConversation,
  useCreateConversation,
  useAppendMessages,
} from "@/services/conversations";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function ChatSessionLoader({
  conversationId,
  onOpenDrawer,
  onConversationCreated,
}: {
  conversationId: string | null;
  onOpenDrawer: () => void;
  onConversationCreated: (id: string) => void;
}) {
  const { data: conversationData, isLoading } = useConversation(conversationId);
  const [accentColor] = useThemeColor(["accent"]);

  if (conversationId && isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color={accentColor} />
      </SafeAreaView>
    );
  }

  return (
    <ChatSession
      conversationId={conversationId}
      initialMessages={conversationData?.messages || []}
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
  const isPremium = Boolean((session?.user as { isPremium?: boolean } | undefined)?.isPremium);

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
  const belowTopChrome = menuTop + 44;

  const createConversation = useCreateConversation();
  const appendMessages = useAppendMessages();
  
  const conversationIdRef = useRef(conversationId);
  
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  const cookies = authClient.getCookie();
  const { height } = useReanimatedKeyboardAnimation();

  const fakeViewStyle = useAnimatedStyle(() => ({
    height: Math.abs(height.value),
  }));

  const lastSavedCountRef = useRef(initialMessages.length);
  const pendingSaveRef = useRef(false);

  const { messages, sendMessage, status, error } = useChat({
    messages: initialMessages as any,
    transport: new DefaultChatTransport({
      api: generateAPIUrl("/api/chat"),
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      headers: cookies ? { Cookie: cookies } : undefined,
    }),
    onError: (err) => console.error("Chat error:", err),
  });

  const isStreaming = status === "streaming";
  const prevStatusRef = useRef(status);

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

  const handleReceiptUploaded = (file: { url: string; mediaType: string }) => {
    if (isStreaming) return;
    const text = input.trim() || "Scan this bill";
    sendMessage({
      role: "user",
      parts: [
        { type: "text", text },
        { type: "file", mediaType: file.mediaType, url: file.url },
      ],
    } as any);
    setInput("");
  };

  const handleSend = () => {
    if (isStreaming) return;

    if (selectedTransaction) {
      const prefix = `[ATTACHED_TRANSACTION: id=${selectedTransaction.id}, type=${selectedTransaction.type}, item=${selectedTransaction.item}, amount=${selectedTransaction.amount}, action=${selectedTransaction.action}]`;

      if (selectedTransaction.action === "delete") {
        sendMessage({ text: prefix });
        setSelectedTransaction(null);
        setInput("");
        return;
      }

      const text = input.trim();
      if (!text) return;
      sendMessage({ text: `${prefix} ${text}` });
      setInput("");
      setSelectedTransaction(null);
      return;
    }

    const text = input.trim();
    if (!text) return;
    sendMessage({ text });
    setInput("");
  };

  /** Same routing as `handleSend`, but with explicit text (voice STT). */
  const handleVoiceTranscript = (transcript: string) => {
    const trimmed = transcript.trim();
    if (!trimmed || isStreaming) return;

    if (selectedTransaction) {
      const prefix = `[ATTACHED_TRANSACTION: id=${selectedTransaction.id}, type=${selectedTransaction.type}, item=${selectedTransaction.item}, amount=${selectedTransaction.amount}, action=${selectedTransaction.action}]`;
      if (selectedTransaction.action === "delete") return;
      sendMessage({ text: `${prefix} ${trimmed}` });
      setInput("");
      setSelectedTransaction(null);
      return;
    }

    sendMessage({ text: trimmed });
    setInput("");
  };

  const handleSuggestion = (suggestion: string) => {
    if (isStreaming) return;
    sendMessage({ text: suggestion });
  };

  const handleEdit = (
    id: string,
    type: "expense" | "income",
    item: string,
    amount: number,
  ) => {
    setSelectedTransaction({ id, type, item, amount, action: "edit" });
  };

  const handleDelete = (
    id: string,
    type: "expense" | "income",
    item: string,
    amount: number,
  ) => {
    setSelectedTransaction({ id, type, item, amount, action: "delete" });
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

      {error && (
        <View
          className="mx-4 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3"
          style={{ marginTop: belowTopChrome }}
        >
          <Text className="text-sm font-medium text-danger leading-snug">
            {error.message.includes("403")
              ? "No free trials remaining. Upgrade to premium."
              : "Something went wrong. Try again."}
          </Text>
        </View>
      )}

      <View className="flex-1" style={{ paddingTop: belowTopChrome }}>
        {messages.length === 0 ? (
          <ChatEmptyState onSuggestion={handleSuggestion} />
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

      <Animated.View style={fakeViewStyle} />

      <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
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
          isLoading={isStreaming}
          selectedTransaction={selectedTransaction}
          isPremium={isPremium}
          onReceiptUploaded={handleReceiptUploaded}
          onVoiceTranscript={handleVoiceTranscript}
        />
      </KeyboardStickyView>
    </SafeAreaView>
  );
}

const Drawer = createDrawerNavigator();

export default function HomeScreen() {
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
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
            key={currentConversationId || "new"}
            conversationId={currentConversationId}
            onOpenDrawer={() => props.navigation.openDrawer()}
            onConversationCreated={setCurrentConversationId}
          />
        )}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}
