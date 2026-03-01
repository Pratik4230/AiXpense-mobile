import {
  View,
  Text,
  FlatList,
  useWindowDimensions,
  useColorScheme,
} from "react-native";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import { Ionicons } from "@expo/vector-icons";
import { Chip } from "heroui-native";
import { ToolLoading } from "./ToolLoading";
import { useRef } from "react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  parts: any[];
}

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

function Divider({ isDark }: { isDark: boolean }) {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
        marginVertical: 10,
      }}
    />
  );
}

function StatusDot({ color }: { color: string }) {
  return (
    <View
      style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }}
    />
  );
}

function CardContent({
  type,
  item,
  amount,
  category,
  subcategory,
  isDark,
  accent,
  minWidth,
}: {
  type: "expense" | "income";
  item: string;
  amount: number;
  category: string;
  subcategory?: string;
  isDark: boolean;
  accent: string;
  minWidth: number;
}) {
  const isExpense = type === "expense";
  return (
    <View
      style={{
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
        backgroundColor: isDark ? "#18181b" : "#ffffff",
        padding: 14,
        minWidth,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          marginBottom: 12,
        }}
      >
        <StatusDot color={accent} />
        <Text
          style={{
            fontSize: 12,
            fontWeight: "600",
            color: isDark ? "#a1a1aa" : "#71717a",
          }}
        >
          {isExpense ? "Expense saved" : "Income saved"}
        </Text>
      </View>

      <Text
        style={{
          fontSize: 24,
          fontWeight: "700",
          color: accent,
          marginBottom: 2,
        }}
      >
        {isExpense ? fmt(amount) : `+${fmt(amount)}`}
      </Text>
      <Text style={{ fontSize: 14, color: isDark ? "#d4d4d8" : "#3f3f46" }}>
        {item}
      </Text>

      <Divider isDark={isDark} />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            fontSize: 12,
            color: isDark ? "#71717a" : "#a1a1aa",
            marginRight: 8,
          }}
        >
          Category
        </Text>
        <Chip size="sm" variant="secondary">
          <Chip.Label style={{ fontSize: 11 }}>
            {subcategory ? `${category} / ${subcategory}` : category}
          </Chip.Label>
        </Chip>
      </View>
    </View>
  );
}

function SavedCard({
  id,
  type,
  item,
  amount,
  category,
  subcategory,
  onEdit,
  onDelete,
}: {
  id?: string;
  type: "expense" | "income";
  item: string;
  amount: number;
  category: string;
  subcategory?: string;
  onEdit?: (
    id: string,
    type: "expense" | "income",
    item: string,
    amount: number,
  ) => void;
  onDelete?: (
    id: string,
    type: "expense" | "income",
    item: string,
    amount: number,
  ) => void;
}) {
  const isDark = useColorScheme() === "dark";
  const { width } = useWindowDimensions();
  const isExpense = type === "expense";
  const accent = isExpense ? "#10b981" : "#3b82f6";
  const swipeRef = useRef<SwipeableMethods>(null);
  const minWidth = width * 0.7;

  if (!id || (!onEdit && !onDelete)) {
    return (
      <CardContent
        type={type}
        item={item}
        amount={amount}
        category={category}
        subcategory={subcategory}
        isDark={isDark}
        accent={accent}
        minWidth={minWidth}
      />
    );
  }

  const renderRightActions = () => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingLeft: 8,
      }}
    >
      {onEdit && (
        <Pressable
          onPress={() => {
            swipeRef.current?.close();
            onEdit(id, type, item, amount);
          }}
          style={({ pressed }) => ({
            backgroundColor: pressed ? "#2563eb" : "#3b82f6",
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
            alignSelf: "stretch",
          })}
        >
          <Ionicons name="pencil" size={18} color="#fff" />
          <Text
            style={{ color: "#fff", fontSize: 11, fontWeight: "600", marginTop: 4 }}
          >
            Edit
          </Text>
        </Pressable>
      )}
      {onDelete && (
        <Pressable
          onPress={() => {
            swipeRef.current?.close();
            onDelete(id, type, item, amount);
          }}
          style={({ pressed }) => ({
            backgroundColor: pressed ? "#dc2626" : "#ef4444",
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
            alignSelf: "stretch",
          })}
        >
          <Ionicons name="trash" size={18} color="#fff" />
          <Text
            style={{ color: "#fff", fontSize: 11, fontWeight: "600", marginTop: 4 }}
          >
            Delete
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <ReanimatedSwipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      onSwipeableWillOpen={() => {}}
      friction={2}
      rightThreshold={60}
      overshootRight={false}
      onSwipeableOpen={() => swipeRef.current?.close()}
    >
      <CardContent
        type={type}
        item={item}
        amount={amount}
        category={category}
        subcategory={subcategory}
        isDark={isDark}
        accent={accent}
        minWidth={minWidth}
      />
    </ReanimatedSwipeable>
  );
}

function DeletedCard({
  type,
  item,
  amount,
}: {
  type: "expense" | "income";
  item: string;
  amount: number;
}) {
  const isDark = useColorScheme() === "dark";

  return (
    <View
      style={{
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
        backgroundColor: isDark ? "#18181b" : "#ffffff",
        padding: 14,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          marginBottom: 12,
        }}
      >
        <StatusDot color="#ef4444" />
        <Text
          style={{
            fontSize: 12,
            fontWeight: "600",
            color: isDark ? "#a1a1aa" : "#71717a",
          }}
        >
          {type === "expense" ? "Expense" : "Income"} deleted
        </Text>
      </View>
      <Text
        style={{
          fontSize: 22,
          fontWeight: "700",
          color: isDark ? "#52525b" : "#a1a1aa",
          textDecorationLine: "line-through",
          marginBottom: 2,
        }}
      >
        {fmt(amount)}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: isDark ? "#52525b" : "#a1a1aa",
          textDecorationLine: "line-through",
        }}
      >
        {item}
      </Text>
    </View>
  );
}

function UpdatedCard({
  type,
  item,
  amount,
  category,
}: {
  type: "expense" | "income";
  item: string;
  amount: number;
  category: string;
}) {
  const isDark = useColorScheme() === "dark";

  return (
    <View
      style={{
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
        backgroundColor: isDark ? "#18181b" : "#ffffff",
        padding: 14,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <StatusDot color="#f97316" />
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: isDark ? "#a1a1aa" : "#71717a",
            }}
          >
            {type === "expense" ? "Expense" : "Income"} updated
          </Text>
        </View>
      </View>

      <Text
        style={{
          fontSize: 24,
          fontWeight: "700",
          color: isDark ? "#f4f4f5" : "#18181b",
          marginBottom: 2,
        }}
      >
        {fmt(amount)}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: isDark ? "#d4d4d8" : "#3f3f46",
          marginBottom: 0,
        }}
      >
        {item}
      </Text>

      <Divider isDark={isDark} />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            fontSize: 12,
            color: isDark ? "#71717a" : "#a1a1aa",
            marginRight: 8,
          }}
        >
          Category
        </Text>
        <Chip size="sm" variant="secondary">
          <Chip.Label style={{ fontSize: 11 }}>{category}</Chip.Label>
        </Chip>
      </View>
    </View>
  );
}

function renderToolCard(
  msg: ChatMessage,
  part: any,
  index: number,
  onAction: (text: string) => void,
) {
  const key = `tool-${msg.id}-${index}`;

  const handleEdit = (
    id: string,
    type: "expense" | "income",
    item: string,
    amount: number,
  ) => {
    onAction(
      `[ATTACHED_TRANSACTION: id=${id}, type=${type}, item=${item}, amount=${amount}, action=edit] `,
    );
  };

  const handleDelete = (
    id: string,
    type: "expense" | "income",
    item: string,
    amount: number,
  ) => {
    onAction(
      `[ATTACHED_TRANSACTION: id=${id}, type=${type}, item=${item}, amount=${amount}, action=delete]`,
    );
  };

  if (part.type === "tool-saveExpense") {
    if (part.state === "output-available" && part.output?.expense) {
      const e = part.output.expense;
      return (
        <SavedCard
          key={key}
          id={e.id}
          type="expense"
          item={e.item}
          amount={e.amount}
          category={e.category}
          subcategory={e.subcategory}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      );
    }
    if (part.state === "input-streaming" || part.state === "input-available") {
      return <ToolLoading key={key} type="expense" />;
    }
  }

  if (part.type === "tool-saveIncome") {
    if (part.state === "output-available" && part.output?.income) {
      const inc = part.output.income;
      return (
        <SavedCard
          key={key}
          id={inc.id}
          type="income"
          item={inc.source}
          amount={inc.amount}
          category={inc.category}
          subcategory={inc.subcategory}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      );
    }
    if (part.state === "input-streaming" || part.state === "input-available") {
      return <ToolLoading key={key} type="income" />;
    }
    return null;
  }

  if (part.type === "tool-searchTransactions") {
    if (part.state === "input-streaming" || part.state === "input-available") {
      return <ToolLoading key={key} type="thinking" />;
    }
    return null;
  }

  if (part.type === "tool-deleteTransaction") {
    if (
      part.state === "output-available" &&
      part.output?.success &&
      part.output.deleted
    ) {
      const d = part.output.deleted;
      return (
        <DeletedCard
          key={key}
          type={d.type as "expense" | "income"}
          item={d.item}
          amount={d.amount}
        />
      );
    }
    if (part.state === "input-streaming" || part.state === "input-available") {
      return <ToolLoading key={key} type="thinking" />;
    }
  }

  if (part.type === "tool-updateTransaction") {
    if (
      part.state === "output-available" &&
      part.output?.success &&
      part.output.transaction
    ) {
      const t = part.output.transaction;
      return (
        <UpdatedCard
          key={key}
          type={t.type as "expense" | "income"}
          item={t.item}
          amount={t.amount}
          category={t.category}
        />
      );
    }
    if (part.state === "input-streaming" || part.state === "input-available") {
      return <ToolLoading key={key} type="thinking" />;
    }
  }

  return null;
}

function MessageBubble({
  message,
  isDark,
  onAction,
}: {
  message: ChatMessage;
  isDark: boolean;
  onAction: (text: string) => void;
}) {
  const isUser = message.role === "user";
  const toolParts = message.parts?.filter((p) => p.type !== "text") ?? [];
  const textParts = message.parts?.filter((p) => p.type === "text") ?? [];
  const hasTools = toolParts.length > 0;

  return (
    <View
      className={`mb-4 ${isUser ? "items-end" : "items-start"}`}
      style={{ maxWidth: "88%", alignSelf: isUser ? "flex-end" : "flex-start" }}
    >
      {!isUser && hasTools && (
        <View
          style={{
            gap: 8,
            width: "100%",
            marginBottom: textParts.some((p) => p.text?.trim()) ? 8 : 0,
          }}
        >
          {toolParts.map((part, i) =>
            renderToolCard(message, part, i, onAction),
          )}
        </View>
      )}

      {textParts.length > 0 && textParts.some((p) => p.text?.trim()) && (
        <View
          style={{
            borderRadius: 18,
            paddingHorizontal: 14,
            paddingVertical: 10,
            backgroundColor: isUser
              ? isDark
                ? "#ea580c"
                : "#f97316"
              : isDark
                ? "#27272a"
                : "#f3f4f6",
            borderBottomRightRadius: isUser ? 4 : 18,
            borderBottomLeftRadius: isUser ? 18 : 4,
          }}
        >
          {textParts.map((part, i) => (
            <Text
              key={`${message.id}-text-${i}`}
              style={{
                fontSize: 15,
                lineHeight: 22,
                color: isUser ? "#fff" : isDark ? "#e4e4e7" : "#1f2937",
              }}
            >
              {part.text}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

interface Props {
  messages: ChatMessage[];
  isStreaming: boolean;
  onAction: (text: string) => void;
  flatListRef?: React.RefObject<FlatList | null>;
}

export function MessageList({ messages, isStreaming, onAction }: Props) {
  const isDark = useColorScheme() === "dark";

  const data = (() => {
    const base =
      isStreaming &&
      messages.length > 0 &&
      messages[messages.length - 1].role === "user"
        ? [
            ...messages,
            {
              id: "__loading__",
              role: "assistant" as const,
              parts: [{ type: "loading" }],
            },
          ]
        : [...messages];
    return base.reverse();
  })();

  return (
    <FlatList
      data={data}
      inverted
      renderItem={({ item }) => {
        if (item.id === "__loading__") {
          return (
            <View style={{ alignSelf: "flex-start", marginBottom: 16 }}>
              <View
                style={{
                  borderRadius: 18,
                  borderBottomLeftRadius: 4,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  backgroundColor: isDark ? "#27272a" : "#f3f4f6",
                }}
              >
                <ToolLoading type="thinking" />
              </View>
            </View>
          );
        }
        return (
          <MessageBubble message={item} isDark={isDark} onAction={onAction} />
        );
      }}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 8,
      }}
      showsVerticalScrollIndicator={false}
    />
  );
}
