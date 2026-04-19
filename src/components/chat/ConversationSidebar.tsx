import {
  View,
  Text,
  Pressable,
  FlatList,
  Alert,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  useConversations,
  useDeleteConversation,
} from "@/services/conversations";
import { isToday, isYesterday, isThisWeek, parseISO } from "date-fns";
import { ConversationSummary } from "@/types/conversation";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColor } from "heroui-native";

interface ConversationSidebarProps {
  currentId: string | null;
  onSelect: (id: string | null) => void;
  onClose: () => void;
}

type GroupedConversations = {
  title: string;
  data: ConversationSummary[];
};

const SECTION_ORDER = [
  "Today",
  "Yesterday",
  "Previous 7 Days",
  "Older",
] as const;

export function ConversationSidebar({
  currentId,
  onSelect,
  onClose,
}: ConversationSidebarProps) {
  const { data: conversations, isLoading } = useConversations();
  const deleteMutation = useDeleteConversation();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";
  const [accentColor, mutedColor, dangerColor] = useThemeColor([
    "accent",
    "muted",
    "danger",
  ]);

  const grouped = (conversations || []).reduce(
    (acc: Record<string, ConversationSummary[]>, chat) => {
      const date = parseISO(chat.updatedAt);
      if (isToday(date)) {
        acc["Today"] = [...(acc["Today"] || []), chat];
      } else if (isYesterday(date)) {
        acc["Yesterday"] = [...(acc["Yesterday"] || []), chat];
      } else if (isThisWeek(date)) {
        acc["Previous 7 Days"] = [...(acc["Previous 7 Days"] || []), chat];
      } else {
        acc["Older"] = [...(acc["Older"] || []), chat];
      }
      return acc;
    },
    {},
  );

  const sections: GroupedConversations[] = SECTION_ORDER.filter(
    (key) => (grouped[key] ?? []).length > 0,
  ).map((title) => ({
    title,
    data: grouped[title]!,
  }));

  const hasAnyChats = sections.length > 0;

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete conversation",
      "This chat will be removed from this device. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteMutation.mutate(id);
            if (currentId === id) {
              onSelect(null);
            }
          },
        },
      ],
    );
  };

  const openNewChat = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(null);
    onClose();
  };

  return (
    <View
      className="flex-1 bg-background border-r border-separator"
      style={{
        paddingTop: insets.top,
        paddingBottom: Math.max(insets.bottom, 12),
      }}
    >
      <View className="flex-row items-center justify-between px-4 pb-3 pt-1">
        <View>
          <Text className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            AiXpense
          </Text>
          <Text className="text-xl font-bold text-foreground mt-0.5">
            Chats
          </Text>
        </View>
        <Pressable
          onPress={() => {
            void Haptics.selectionAsync();
            onClose();
          }}
          hitSlop={12}
          className="h-10 w-10 items-center justify-center rounded-full bg-default active:opacity-70"
          accessibilityLabel="Close sidebar"
        >
          <Feather name="x" size={22} color={mutedColor} />
        </Pressable>
      </View>

      <Pressable
        onPress={openNewChat}
        className="mx-3 mb-4 flex-row items-center gap-3 rounded-2xl border border-accent/35 bg-accent/10 px-4 py-3.5 active:opacity-90"
        accessibilityRole="button"
        accessibilityLabel="Start new chat"
      >
        <View className="h-10 w-10 items-center justify-center rounded-full bg-accent/20">
          <Feather name="edit-3" size={18} color={accentColor} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground">
            New chat
          </Text>
          <Text className="text-xs text-muted mt-0.5">
            Clear context and start fresh
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={mutedColor} />
      </Pressable>

      {isLoading ? (
        <View className="flex-1 items-center justify-center py-12">
          <ActivityIndicator size="small" color={accentColor} />
          <Text className="text-sm text-muted mt-3">Loading history…</Text>
        </View>
      ) : !hasAnyChats ? (
        <View className="flex-1 items-center justify-center px-8 pb-16">
          <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl border border-separator bg-surface">
            <Feather name="message-circle" size={26} color={mutedColor} />
          </View>
          <Text className="text-base font-semibold text-foreground text-center">
            No conversations yet
          </Text>
          <Text className="text-sm text-muted text-center mt-2 leading-relaxed">
            Your chat history will appear here. Use New chat to begin.
          </Text>
        </View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item) => item.title}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
          renderItem={({ item }) => (
            <View className="mb-5">
              <Text className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                {item.title}
              </Text>
              <View className="gap-1 px-2">
                {item.data.map((chat) => {
                  const selected = currentId === chat._id;
                  return (
                    <Pressable
                      key={chat._id}
                      onPress={() => {
                        void Haptics.selectionAsync();
                        onSelect(chat._id);
                        onClose();
                      }}
                      className={`flex-row items-center rounded-xl border px-3 py-2.5 active:opacity-90 ${
                        selected
                          ? "border-accent/40 bg-accent/12"
                          : "border-transparent bg-transparent"
                      }`}
                      android_ripple={
                        isDark
                          ? { color: "rgba(255,255,255,0.08)" }
                          : { color: "rgba(0,0,0,0.06)" }
                      }
                    >
                      <View className="flex-1 min-w-0 pr-2">
                        <Text
                          numberOfLines={2}
                          className={`text-[15px] leading-snug ${
                            selected
                              ? "font-semibold text-foreground"
                              : "font-medium text-foreground"
                          }`}
                        >
                          {chat.title || "New conversation"}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => handleDelete(chat._id)}
                        hitSlop={10}
                        className="h-9 w-9 items-center justify-center rounded-full bg-default/80 active:opacity-70"
                        accessibilityLabel="Delete conversation"
                      >
                        <Feather name="trash-2" size={16} color={dangerColor} />
                      </Pressable>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
