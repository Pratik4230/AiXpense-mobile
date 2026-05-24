import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Skeleton, useThemeColor } from "heroui-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SafeAreaView } from "@/components/ui";
import { RecurringCard } from "@/components/recurring/RecurringCard";
import {
  useRecurringPayments,
  useUpdateRecurringPayment,
  useDeleteRecurringPayment,
  type RecurringPayment,
} from "@/services/recurring";

export default function RecurringScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [accentColor, mutedColor] = useThemeColor(["accent", "muted"]);

  const [showAll, setShowAll] = useState(false);

  const { data, isLoading, isRefetching, refetch } = useRecurringPayments(
    !showAll,
  );
  const update = useUpdateRecurringPayment();
  const remove = useDeleteRecurringPayment();

  const rules = data?.data ?? [];
  const bottomPad = Math.max(insets.bottom, 20) + 8;

  const openCreate = () => router.push("/recurring/form");
  const openEdit = (rule: RecurringPayment) =>
    router.push({ pathname: "/recurring/form", params: { id: rule._id } });

  const handleToggle = (rule: RecurringPayment) => {
    update.mutate(
      { id: rule._id, isActive: !rule.isActive },
      {
        onError: () => Alert.alert("Error", "Failed to update."),
      },
    );
  };

  const handleDelete = (rule: RecurringPayment) => {
    remove.mutate(rule._id, {
      onError: () => Alert.alert("Error", "Failed to delete."),
    });
  };

  const ListHeader = useCallback(
    () => (
      <View className="pb-4">
        <View className="flex-row items-center justify-between gap-3 mb-4">
          <View className="flex-row items-center gap-2 flex-1">
            <Text className="text-sm font-medium text-muted">
              {showAll ? "All rules" : "Active rules"}
            </Text>
            <Pressable
              onPress={() => setShowAll((p) => !p)}
              className="px-2.5 py-1 rounded-lg bg-default active:opacity-80"
            >
              <Text className="text-xs font-semibold text-accent">
                {showAll ? "Active only" : "Show all"}
              </Text>
            </Pressable>
          </View>
          <Button size="sm" onPress={openCreate}>
            <Ionicons name="add" size={17} color="white" />
            <Button.Label>Add</Button.Label>
          </Button>
        </View>
      </View>
    ),
    [showAll],
  );

  const ListEmpty = () => {
    if (isLoading) {
      return (
        <View className="gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-3xl" />
          ))}
        </View>
      );
    }
    return (
      <View className="items-center py-16 px-6">
        <Ionicons name="repeat-outline" size={48} color={mutedColor} />
        <Text className="text-sm font-medium text-foreground mt-4">
          No recurring payments yet
        </Text>
        <Text className="text-xs text-muted text-center mt-1 leading-relaxed">
          Add subscriptions, rent, or salary to auto-track on a schedule.
        </Text>
        <Button className="mt-5" size="sm" onPress={openCreate}>
          <Button.Label>Add recurring payment</Button.Label>
        </Button>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-separator/60">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          className="mr-3 p-1 active:opacity-70"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={mutedColor} />
        </Pressable>
        <View className="flex-1">
          <Text className="text-lg font-bold text-foreground">
            Recurring payments
          </Text>
          {!isLoading && (
            <Text className="text-xs text-muted">
              {rules.length} {showAll ? "rule" : "active rule"}
              {rules.length === 1 ? "" : "s"}
            </Text>
          )}
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 px-4 pt-4">
          <ListEmpty />
        </View>
      ) : (
        <FlatList
          data={rules}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <RecurringCard
              rule={item}
              onEdit={openEdit}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          )}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmpty}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: bottomPad,
            flexGrow: rules.length === 0 ? 1 : undefined,
          }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={accentColor}
              colors={[accentColor]}
            />
          }
          ListFooterComponent={
            isRefetching && rules.length > 0 ? (
              <ActivityIndicator className="py-4" color={accentColor} />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}
