import { useState } from "react";
import { View, Text, useColorScheme } from "react-native";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { fetch as expoFetch } from "expo/fetch";
import {
  KeyboardStickyView,
  useReanimatedKeyboardAnimation,
} from "react-native-keyboard-controller";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { SafeAreaView } from "@/components/ui";
import { authClient } from "@/lib/authClient";
import { generateAPIUrl } from "@/utils/api";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatEmptyState } from "@/components/chat/ChatEmptyState";

export default function ChatScreen() {
  const isDark = useColorScheme() === "dark";
  const [input, setInput] = useState("");

  const cookies = authClient.getCookie();
  const { height } = useReanimatedKeyboardAnimation();

  const fakeViewStyle = useAnimatedStyle(() => ({
    height: Math.abs(height.value),
  }));

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: generateAPIUrl("/api/chat"),
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      headers: cookies ? { Cookie: cookies } : undefined,
    }),
    onError: (err) => console.error("Chat error:", err),
  });

  const isStreaming = status === "streaming";

  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    sendMessage({ text });
    setInput("");
  };

  const handleSuggestion = (suggestion: string) => {
    if (isStreaming) return;
    sendMessage({ text: suggestion });
  };

  const handleAction = (text: string) => {
    if (isStreaming) return;
    sendMessage({ text });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 py-3 border-b border-border/30 flex-row items-center gap-3">
        <View
          className="w-8 h-8 rounded-xl items-center justify-center"
          style={{
            backgroundColor: isDark
              ? "rgba(249,115,22,0.15)"
              : "rgba(234,88,12,0.1)",
          }}
        >
          <Text style={{ fontSize: 16 }}>✦</Text>
        </View>
        <View>
          <Text
            className="text-base font-bold"
            style={{ color: isDark ? "#fafafa" : "#18181b" }}
          >
            AiXpense
          </Text>
          <Text
            className="text-xs"
            style={{ color: isDark ? "#71717a" : "#a1a1aa" }}
          >
            {isStreaming ? "Typing..." : "AI assistant"}
          </Text>
        </View>
      </View>

      {error && (
        <View
          className="mx-4 mt-2 px-3 py-2 rounded-lg"
          style={{ backgroundColor: "rgba(239,68,68,0.1)" }}
        >
          <Text className="text-xs" style={{ color: "#ef4444" }}>
            {error.message.includes("403")
              ? "No free trials remaining. Upgrade to premium."
              : "Something went wrong. Try again."}
          </Text>
        </View>
      )}

      {messages.length === 0 ? (
        <ChatEmptyState onSuggestion={handleSuggestion} />
      ) : (
        <MessageList
          messages={messages as any}
          isStreaming={isStreaming}
          onAction={handleAction}
        />
      )}

      <Animated.View style={fakeViewStyle} />

      <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          isLoading={isStreaming}
        />
      </KeyboardStickyView>
    </SafeAreaView>
  );
}
