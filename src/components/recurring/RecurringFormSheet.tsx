import { useEffect } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import {
  BottomSheet,
  Button,
  TextField,
  Input,
  Label,
  FieldError,
} from "heroui-native";
import {
  CATEGORIES,
  EXPENSE_TYPES,
  FREQUENCIES,
  type Category,
  type ExpenseType,
  type Frequency,
} from "@/constants/expense";
import type {
  RecurringPayment,
  CreateRecurringPaymentInput,
} from "@/services/recurring";
import { useCurrency } from "@/hooks/useCurrency";

const DAYS = Array.from({ length: 28 }, (_, i) => i + 1);

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) > 0,
      "Enter a positive amount",
    ),
  category: z.string().min(1, "Select a category"),
  type: z.enum(EXPENSE_TYPES),
  frequency: z.enum(FREQUENCIES),
  recurOnDate: z.number().int().min(1).max(28),
  startDate: z
    .string()
    .min(1, "Start date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function toDateInput(iso?: string): string {
  if (!iso) return new Date().toISOString().slice(0, 10);
  return new Date(iso).toISOString().slice(0, 10);
}

function weekdayHint(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "EEEE");
  } catch {
    return "";
  }
}

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreateRecurringPaymentInput) => void;
  isPending: boolean;
  defaultValues?: RecurringPayment;
}

export function RecurringFormSheet({
  isOpen,
  onOpenChange,
  onSubmit,
  isPending,
  defaultValues,
}: Props) {
  const isEdit = !!defaultValues;
  const { symbol } = useCurrency();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      amount: "",
      category: "bills",
      type: "expense",
      frequency: "monthly",
      recurOnDate: 1,
      startDate: toDateInput(),
      notes: "",
    },
  });

  const frequency = watch("frequency");

  useEffect(() => {
    if (!isOpen) return;
    reset({
      name: defaultValues?.name ?? "",
      amount: defaultValues?.amount ? String(defaultValues.amount) : "",
      category: defaultValues?.category ?? "bills",
      type: defaultValues?.type ?? "expense",
      frequency: defaultValues?.frequency ?? "monthly",
      recurOnDate: defaultValues?.recurOnDate ?? 1,
      startDate: toDateInput(defaultValues?.startDate),
      notes: defaultValues?.notes ?? "",
    });
  }, [isOpen, defaultValues, reset]);

  const handleClose = () => onOpenChange(false);

  const onFormSubmit = (data: FormData) => {
    onSubmit({
      name: data.name.trim(),
      amount: Number(data.amount),
      category: data.category as Category,
      type: data.type as ExpenseType,
      frequency: data.frequency as Frequency,
      recurOnDate:
        data.frequency === "monthly" ? data.recurOnDate : undefined,
      startDate: data.startDate,
      notes: data.notes?.trim() || undefined,
    });
  };

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content snapPoints={["75%", "92%"]}>
          <BottomSheet.Title>
            {isEdit ? "Edit recurring payment" : "New recurring payment"}
          </BottomSheet.Title>
          <Text className="text-sm text-muted leading-snug -mt-1 mb-1">
            Auto-track repeating expenses or income on a schedule.
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            className="mt-2"
          >
            <View className="gap-4 pb-6">
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value } }) => (
                  <TextField isInvalid={!!errors.name}>
                    <Label>Name</Label>
                    <Input
                      placeholder="Netflix, rent, EMI…"
                      value={value}
                      onChangeText={onChange}
                    />
                    <FieldError>{errors.name?.message}</FieldError>
                  </TextField>
                )}
              />

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Controller
                    control={control}
                    name="amount"
                    render={({ field: { onChange, value } }) => (
                      <TextField isInvalid={!!errors.amount}>
                        <Label>Amount ({symbol})</Label>
                        <Input
                          placeholder="0"
                          value={value}
                          onChangeText={onChange}
                          keyboardType="decimal-pad"
                        />
                        <FieldError>{errors.amount?.message}</FieldError>
                      </TextField>
                    )}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Type
                  </Text>
                  <Controller
                    control={control}
                    name="type"
                    render={({ field: { value, onChange } }) => (
                      <View className="flex-row gap-2">
                        {EXPENSE_TYPES.map((t) => (
                          <Pressable
                            key={t}
                            onPress={() => onChange(t)}
                            className={`flex-1 py-2.5 rounded-2xl border-[1.5px] items-center ${
                              value === t
                                ? "border-accent bg-accent-soft"
                                : "border-separator"
                            }`}
                          >
                            <Text
                              className={`text-xs font-semibold capitalize ${
                                value === t ? "text-accent" : "text-foreground"
                              }`}
                            >
                              {t}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  />
                </View>
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">
                  Category
                </Text>
                <Controller
                  control={control}
                  name="category"
                  render={({ field: { value, onChange } }) => (
                    <View className="flex-row flex-wrap gap-2">
                      {CATEGORIES.map((c) => (
                        <Pressable
                          key={c}
                          onPress={() => onChange(c)}
                          className={`px-3 py-2 rounded-2xl border-[1.5px] ${
                            value === c
                              ? "border-accent bg-accent-soft"
                              : "border-separator"
                          }`}
                        >
                          <Text
                            className={`text-xs capitalize ${
                              value === c
                                ? "text-accent font-semibold"
                                : "text-foreground"
                            }`}
                          >
                            {c}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                />
                {errors.category && (
                  <Text className="text-xs text-danger mt-1">
                    {errors.category.message}
                  </Text>
                )}
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">
                  Frequency
                </Text>
                <Controller
                  control={control}
                  name="frequency"
                  render={({ field: { value, onChange } }) => (
                    <View className="flex-row flex-wrap gap-2">
                      {FREQUENCIES.map((f) => (
                        <Pressable
                          key={f}
                          onPress={() => onChange(f)}
                          className={`px-3 py-2 rounded-2xl border-[1.5px] ${
                            value === f
                              ? "border-accent bg-accent-soft"
                              : "border-separator"
                          }`}
                        >
                          <Text
                            className={`text-xs capitalize ${
                              value === f
                                ? "text-accent font-semibold"
                                : "text-foreground"
                            }`}
                          >
                            {f}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                />
              </View>

              {frequency === "monthly" ? (
                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Day of month
                  </Text>
                  <Controller
                    control={control}
                    name="recurOnDate"
                    render={({ field: { value, onChange } }) => (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 8 }}
                      >
                        {DAYS.map((d) => (
                          <Pressable
                            key={d}
                            onPress={() => onChange(d)}
                            className={`w-10 h-10 rounded-xl border-[1.5px] items-center justify-center ${
                              value === d
                                ? "border-accent bg-accent-soft"
                                : "border-separator"
                            }`}
                          >
                            <Text
                              className={`text-sm font-medium ${
                                value === d ? "text-accent" : "text-foreground"
                              }`}
                            >
                              {d}
                            </Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    )}
                  />
                  <Text className="text-xs text-muted mt-2">
                    Max day 28 — safe across all months.
                  </Text>
                </View>
              ) : (
                <Controller
                  control={control}
                  name="startDate"
                  render={({ field: { onChange, value } }) => (
                    <TextField isInvalid={!!errors.startDate}>
                      <Label>Start date</Label>
                      <Input
                        placeholder="YYYY-MM-DD"
                        value={value}
                        onChangeText={onChange}
                        autoCapitalize="none"
                      />
                      <FieldError>{errors.startDate?.message}</FieldError>
                      {frequency === "weekly" && value ? (
                        <Text className="text-xs text-muted mt-1">
                          Recurs every {weekdayHint(value)}
                        </Text>
                      ) : null}
                      {frequency === "yearly" && value ? (
                        <Text className="text-xs text-muted mt-1">
                          Recurs every year on this date
                        </Text>
                      ) : null}
                      {frequency === "daily" && value ? (
                        <Text className="text-xs text-muted mt-1">
                          Recurs daily from this date
                        </Text>
                      ) : null}
                    </TextField>
                  )}
                />
              )}

              <Controller
                control={control}
                name="notes"
                render={({ field: { onChange, value } }) => (
                  <TextField>
                    <Label>Notes (optional)</Label>
                    <Input
                      placeholder="Any notes…"
                      value={value}
                      onChangeText={onChange}
                      multiline
                      numberOfLines={2}
                    />
                  </TextField>
                )}
              />

              <View className="flex-row gap-3 pt-1">
                <Button
                  variant="outline"
                  onPress={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onPress={handleSubmit(onFormSubmit)}
                  isDisabled={isPending}
                  className="flex-1"
                >
                  {isPending ? "Saving…" : isEdit ? "Save" : "Create"}
                </Button>
              </View>
            </View>
          </ScrollView>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
