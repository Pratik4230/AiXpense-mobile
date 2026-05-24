import { useEffect } from "react";
import { View, Text, Pressable, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "heroui-native";
import { SafeAreaView } from "@/components/ui";
import { RecurringForm } from "@/components/recurring/RecurringForm";
import {
  useRecurringPayments,
  useCreateRecurringPayment,
  useUpdateRecurringPayment,
  type CreateRecurringPaymentInput,
  type RecurringFormSubmitValues,
} from "@/services/recurring";

export default function RecurringFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = typeof id === "string" && id.length > 0;
  const [mutedColor, accentColor] = useThemeColor(["muted", "accent"]);

  const { data, isLoading } = useRecurringPayments(!isEdit);
  const create = useCreateRecurringPayment();
  const update = useUpdateRecurringPayment();

  const rule = isEdit ? data?.data?.find((r) => r._id === id) : undefined;

  useEffect(() => {
    if (!isEdit || isLoading) return;
    if (!rule) {
      Alert.alert("Not found", "This recurring payment could not be loaded.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  }, [isEdit, isLoading, rule, router]);

  const handleCreate = (values: RecurringFormSubmitValues) => {
    const { recurOnDate, ...rest } = values;
    const input: CreateRecurringPaymentInput = {
      ...rest,
      ...(typeof recurOnDate === "number" ? { recurOnDate } : {}),
    };
    create.mutate(input, {
      onSuccess: () => {
        Alert.alert("Created", "Recurring payment rule added.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      },
      onError: () =>
        Alert.alert("Error", "Failed to create recurring payment."),
    });
  };

  const handleEdit = (values: RecurringFormSubmitValues) => {
    if (!id) return;
    update.mutate(
      { id, ...values },
      {
        onSuccess: () => {
          Alert.alert("Saved", "Recurring payment updated.", [
            { text: "OK", onPress: () => router.back() },
          ]);
        },
        onError: () => Alert.alert("Error", "Failed to update."),
      },
    );
  };

  const showForm = !isEdit || (!isLoading && !!rule);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-separator/60">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          className="mr-3 p-1 active:opacity-70"
          accessibilityLabel="Go back"
        >
          <Ionicons name="close" size={24} color={mutedColor} />
        </Pressable>
        <View className="flex-1">
          <Text className="text-lg font-bold text-foreground">
            {isEdit ? "Edit recurring payment" : "New recurring payment"}
          </Text>
        </View>
      </View>

      {showForm ? (
        <RecurringForm
          defaultValues={rule}
          onSubmit={isEdit ? handleEdit : handleCreate}
          isPending={isEdit ? update.isPending : create.isPending}
          onCancel={() => router.back()}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={accentColor} />
        </View>
      )}
    </SafeAreaView>
  );
}
