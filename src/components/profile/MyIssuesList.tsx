import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Card, useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { useMyIssues, type MyIssueItem } from "@/hooks/queries/useIssues";

const TYPE_ICONS: Record<string, string> = {
  bug: "bug-outline",
  feature: "bulb-outline",
  other: "help-circle-outline",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const STATUS_COLORS: Record<string, string> = {
  open: "#ef4444",
  in_progress: "#f59e0b",
  resolved: "#22c55e",
  closed: "#6b7280",
};

function IssueCard({ issue }: { issue: MyIssueItem }) {
  const [mutedColor] = useThemeColor(["muted"]);
  const statusColor = STATUS_COLORS[issue.status] ?? mutedColor;

  return (
    <Card className="mb-3">
      <Card.Body className="gap-2 py-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-row items-center gap-1.5 flex-1 min-w-0">
            <Ionicons
              name={TYPE_ICONS[issue.type] as any}
              size={14}
              color={mutedColor}
            />
            <Text
              className="text-sm font-semibold text-foreground flex-1"
              numberOfLines={1}
            >
              {issue.title}
            </Text>
          </View>
          <View
            className="px-2 py-0.5 rounded-full shrink-0"
            style={{ backgroundColor: statusColor + "22" }}
          >
            <Text className="text-xs font-medium" style={{ color: statusColor }}>
              {STATUS_LABELS[issue.status]}
            </Text>
          </View>
        </View>

        <Text
          className="text-xs text-muted leading-relaxed"
          numberOfLines={2}
        >
          {issue.description}
        </Text>

        {!!issue.adminNote && (
          <View className="flex-row items-start gap-1.5 bg-default rounded-lg px-2.5 py-2 mt-1">
            <Ionicons
              name="chatbubble-outline"
              size={12}
              color={mutedColor}
              style={{ marginTop: 1 }}
            />
            <Text className="text-xs text-muted flex-1">{issue.adminNote}</Text>
          </View>
        )}

        <Text className="text-xs text-muted">
          {new Date(issue.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </Text>
      </Card.Body>
    </Card>
  );
}

export function MyIssuesList() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyIssues(page);
  const [mutedColor] = useThemeColor(["muted"]);

  if (isLoading) {
    return (
      <Text className="text-sm text-muted text-center py-6">Loading...</Text>
    );
  }

  if (!data?.issues.length) {
    return (
      <Text className="text-sm text-muted text-center py-6">
        No reports yet.
      </Text>
    );
  }

  return (
    <View>
      <Text className="text-xs text-muted mb-3">{data.total} reported</Text>
      {data.issues.map((issue) => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
      {data.totalPages > 1 && (
        <View className="flex-row items-center justify-between mt-1">
          <Text className="text-xs text-muted">
            Page {data.page} of {data.totalPages}
          </Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setPage((p) => p - 1)}
              disabled={page === 1 || isLoading}
              className="p-1"
            >
              <Ionicons
                name="chevron-back"
                size={18}
                color={page === 1 ? mutedColor + "55" : mutedColor}
              />
            </Pressable>
            <Pressable
              onPress={() => setPage((p) => p + 1)}
              disabled={page === data.totalPages || isLoading}
              className="p-1"
            >
              <Ionicons
                name="chevron-forward"
                size={18}
                color={
                  page === data.totalPages ? mutedColor + "55" : mutedColor
                }
              />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
