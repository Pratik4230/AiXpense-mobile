import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
} from "react-native";
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
  in_progress: "In progress",
  resolved: "Resolved",
  closed: "Closed",
};

function statusChipStyles(status: string): {
  wrap: string;
  label: string;
} {
  switch (status) {
    case "open":
      return {
        wrap: "bg-danger/12 border-danger/25",
        label: "text-danger",
      };
    case "in_progress":
      return {
        wrap: "bg-warning/12 border-warning/30",
        label: "text-warning",
      };
    case "resolved":
      return {
        wrap: "bg-success/12 border-success/25",
        label: "text-success",
      };
    default:
      return {
        wrap: "bg-default border-separator",
        label: "text-muted",
      };
  }
}

function IssueCard({ issue }: { issue: MyIssueItem }) {
  const [mutedColor] = useThemeColor(["muted"]);
  const chip = statusChipStyles(issue.status);

  return (
    <Card className="mb-3 rounded-2xl border border-separator overflow-hidden">
      <Card.Body className="gap-2.5 py-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-row items-center gap-2 flex-1 min-w-0">
            <View className="size-8 rounded-xl bg-default items-center justify-center">
              <Ionicons
                name={TYPE_ICONS[issue.type] as any}
                size={15}
                color={mutedColor}
              />
            </View>
            <Text
              className="text-sm font-semibold text-foreground flex-1 leading-snug"
              numberOfLines={2}
            >
              {issue.title}
            </Text>
          </View>
          <View
            className={`px-2.5 py-1 rounded-full shrink-0 border ${chip.wrap}`}
          >
            <Text className={`text-[11px] font-semibold ${chip.label}`}>
              {STATUS_LABELS[issue.status] ?? issue.status}
            </Text>
          </View>
        </View>

        <Text
          className="text-xs text-muted leading-relaxed pl-10"
          numberOfLines={3}
        >
          {issue.description}
        </Text>

        {!!issue.adminNote && (
          <View className="flex-row items-start gap-2 rounded-xl border border-separator bg-surface px-3 py-2.5 mt-0.5">
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={14}
              color={mutedColor}
              style={{ marginTop: 1 }}
            />
            <View className="flex-1">
              <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-0.5">
                Team reply
              </Text>
              <Text className="text-xs text-foreground leading-relaxed">
                {issue.adminNote}
              </Text>
            </View>
          </View>
        )}

        <Text className="text-[11px] text-muted pl-10">
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
  const [mutedColor, accentColor] = useThemeColor(["muted", "accent"]);

  if (isLoading) {
    return (
      <View className="items-center justify-center py-10 gap-3">
        <ActivityIndicator size="small" color={accentColor} />
        <Text className="text-sm text-muted">Loading reports…</Text>
      </View>
    );
  }

  if (!data?.issues.length) {
    return (
      <View className="items-center py-10 px-4">
        <View className="size-14 items-center justify-center rounded-2xl border border-dashed border-separator mb-3">
          <Ionicons name="document-text-outline" size={26} color={mutedColor} />
        </View>
        <Text className="text-sm font-medium text-foreground text-center">
          No reports yet
        </Text>
        <Text className="text-xs text-muted text-center mt-1 leading-relaxed">
          When you submit an issue, it will show up here with status updates.
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Text className="text-[11px] font-medium text-muted mb-3 uppercase tracking-wider">
        {data.total} {data.total === 1 ? "report" : "reports"}
      </Text>
      {data.issues.map((issue) => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
      {data.totalPages > 1 && (
        <View className="flex-row items-center justify-between mt-3 pt-2 border-t border-separator">
          <Text className="text-xs text-muted">
            Page {data.page} of {data.totalPages}
          </Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setPage((p) => p - 1)}
              disabled={page === 1 || isLoading}
              className={`rounded-full px-3 py-2 border border-separator ${
                page === 1 ? "opacity-40" : "active:opacity-80 bg-default"
              }`}
            >
              <Ionicons name="chevron-back" size={18} color={mutedColor} />
            </Pressable>
            <Pressable
              onPress={() => setPage((p) => p + 1)}
              disabled={page === data.totalPages || isLoading}
              className={`rounded-full px-3 py-2 border border-separator ${
                page === data.totalPages
                  ? "opacity-40"
                  : "active:opacity-80 bg-default"
              }`}
            >
              <Ionicons name="chevron-forward" size={18} color={mutedColor} />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
