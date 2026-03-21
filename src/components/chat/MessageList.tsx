import {
  View,
  Text,
  FlatList,
  useWindowDimensions,
  useColorScheme,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Chip, BottomSheet } from "heroui-native";
import { ToolLoading } from "./ToolLoading";
import { useState } from "react";
import * as Haptics from "expo-haptics";

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

interface ActionTarget {
  id: string;
  type: "expense" | "income";
  item: string;
  amount: number;
}

function CardActionSheet({
  target,
  onClose,
  onEdit,
  onDelete,
}: {
  target: ActionTarget | null;
  onClose: () => void;
  onEdit: (id: string, type: "expense" | "income", item: string, amount: number) => void;
  onDelete: (id: string, type: "expense" | "income", item: string, amount: number) => void;
}) {
  const isDark = useColorScheme() === "dark";

  return (
    <BottomSheet isOpen={!!target} onOpenChange={(v) => !v && onClose()}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content enableDynamicSizing>
          <View style={{ paddingHorizontal: 20, paddingBottom: 32, paddingTop: 8 }}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: isDark ? "#e4e4e7" : "#18181b",
                marginBottom: 4,
              }}
            >
              {target?.item}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: isDark ? "#71717a" : "#a1a1aa",
                marginBottom: 20,
              }}
            >
              {target ? fmt(target.amount) : ""}
            </Text>

            <Pressable
              onPress={() => {
                if (!target) return;
                onClose();
                onEdit(target.id, target.type, target.item, target.amount);
              }}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: 14,
                paddingHorizontal: 4,
                borderRadius: 12,
                backgroundColor: pressed
                  ? isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"
                  : "transparent",
              })}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: isDark ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.1)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="pencil" size={16} color="#3b82f6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "600", color: isDark ? "#e4e4e7" : "#18181b" }}>
                  Edit transaction
                </Text>
                <Text style={{ fontSize: 12, color: isDark ? "#52525b" : "#a1a1aa", marginTop: 1 }}>
                  Change amount, category, or details
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={isDark ? "#52525b" : "#d4d4d8"} />
            </Pressable>

            <View
              style={{
                height: 1,
                backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                marginVertical: 2,
              }}
            />

            <Pressable
              onPress={() => {
                if (!target) return;
                onClose();
                onDelete(target.id, target.type, target.item, target.amount);
              }}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: 14,
                paddingHorizontal: 4,
                borderRadius: 12,
                backgroundColor: pressed
                  ? isDark ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.06)"
                  : "transparent",
              })}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: isDark ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.1)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="trash" size={16} color="#ef4444" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "600", color: "#ef4444" }}>
                  Delete transaction
                </Text>
                <Text style={{ fontSize: 12, color: isDark ? "#52525b" : "#a1a1aa", marginTop: 1 }}>
                  Remove this permanently
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={isDark ? "#52525b" : "#d4d4d8"} />
            </Pressable>
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}

function SavedCard({
  id,
  type,
  item,
  amount,
  category,
  subcategory,
  isOutdated,
  onLongPress,
}: {
  id?: string;
  type: "expense" | "income";
  item: string;
  amount: number;
  category: string;
  subcategory?: string;
  isOutdated?: boolean;
  onLongPress?: () => void;
}) {
  const isDark = useColorScheme() === "dark";
  const { width } = useWindowDimensions();
  const isExpense = type === "expense";
  const accent = isExpense ? "#10b981" : "#3b82f6";
  const minWidth = width * 0.7;
  const canInteract = !!id && !!onLongPress && !isOutdated;

  const card = (
    <View style={{ opacity: isOutdated ? 0.45 : 1 }}>
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
    </View>
  );

  if (!canInteract) return card;

  return (
    <Pressable
      onLongPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress();
      }}
      delayLongPress={300}
    >
      {card}
    </Pressable>
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

function UpdatedCardContent({
  type,
  item,
  amount,
  category,
  isDark,
}: {
  type: "expense" | "income";
  item: string;
  amount: number;
  category: string;
  isDark: boolean;
}) {
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

function UpdatedCard({
  id,
  type,
  item,
  amount,
  category,
  isOutdated,
  onLongPress,
}: {
  id?: string;
  type: "expense" | "income";
  item: string;
  amount: number;
  category: string;
  isOutdated?: boolean;
  onLongPress?: () => void;
}) {
  const isDark = useColorScheme() === "dark";

  const content = (
    <View style={{ opacity: isOutdated ? 0.45 : 1 }}>
      <UpdatedCardContent type={type} item={item} amount={amount} category={category} isDark={isDark} />
    </View>
  );

  if (!id || !onLongPress || isOutdated) return content;

  return (
    <Pressable
      onLongPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress();
      }}
      delayLongPress={300}
    >
      {content}
    </Pressable>
  );
}

function renderToolCard(
  msg: ChatMessage,
  part: any,
  index: number,
  setActionTarget: (target: ActionTarget) => void,
  outdatedIds: Map<string, string>,
) {
  const key = `tool-${msg.id}-${index}`;
  const isOutdated = (id: string) => outdatedIds.has(id) && outdatedIds.get(id) !== msg.id;

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
          isOutdated={isOutdated(e.id)}
          onLongPress={() => setActionTarget({ id: e.id, type: "expense", item: e.item, amount: e.amount })}
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
          isOutdated={isOutdated(inc.id)}
          onLongPress={() => setActionTarget({ id: inc.id, type: "income", item: inc.source, amount: inc.amount })}
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
          id={t.id}
          type={t.type as "expense" | "income"}
          item={t.item}
          amount={t.amount}
          category={t.category}
          isOutdated={isOutdated(t.id)}
          onLongPress={() => setActionTarget({ id: t.id, type: t.type, item: t.item, amount: t.amount })}
        />
      );
    }
    if (part.state === "input-streaming" || part.state === "input-available") {
      return <ToolLoading key={key} type="thinking" />;
    }
  }

  return null;
}

function formatUserText(text: string): string {
  if (!text.includes("[ATTACHED_TRANSACTION:")) return text;
  const actionMatch = text.match(/action=(\w+)/);
  const itemMatch = text.match(/item=([^,\]]+)/);
  const amountMatch = text.match(/amount=(\d+)/);
  const action = actionMatch?.[1];
  const itemName = itemMatch?.[1];
  const amount = amountMatch?.[1];
  const userText = text.split("]").slice(1).join("]").trim();

  if (action === "delete") return `Delete: ${itemName} (\u20b9${amount})`;
  return userText ? `Edit ${itemName}: ${userText}` : `Edit: ${itemName} (\u20b9${amount})`;
}

function MessageBubble({
  message,
  isDark,
  setActionTarget,
  outdatedIds,
}: {
  message: ChatMessage;
  isDark: boolean;
  setActionTarget: (target: ActionTarget) => void;
  outdatedIds: Map<string, string>;
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
            renderToolCard(message, part, i, setActionTarget, outdatedIds),
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
              {isUser ? formatUserText(part.text) : part.text}
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
  onEdit: (id: string, type: "expense" | "income", item: string, amount: number) => void;
  onDelete: (id: string, type: "expense" | "income", item: string, amount: number) => void;
  outdatedIds: Map<string, string>;
  flatListRef?: React.RefObject<FlatList | null>;
}

export function MessageList({ messages, isStreaming, onEdit, onDelete, outdatedIds }: Props) {
  const isDark = useColorScheme() === "dark";
  const [actionTarget, setActionTarget] = useState<ActionTarget | null>(null);

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
    <>
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
            <MessageBubble
              message={item}
              isDark={isDark}
              setActionTarget={setActionTarget}
              outdatedIds={outdatedIds}
            />
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
      <CardActionSheet
        target={actionTarget}
        onClose={() => setActionTarget(null)}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </>
  );
}
