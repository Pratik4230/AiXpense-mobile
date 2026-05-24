import { useEffect } from "react";
import { View, Text } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import {
  Button,
  Chip,
  Description,
  FieldError,
  Input,
  Label,
  TextArea,
  TextField,
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
  RecurringFormSubmitValues,
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
  defaultValues?: RecurringPayment;
  onSubmit: (values: RecurringFormSubmitValues) => void;
  isPending: boolean;
  onCancel: () => void;
}

export function RecurringForm({
  defaultValues,
  onSubmit,
  isPending,
  onCancel,
}: Props) {
  const isEdit = !!defaultValues;
  const insets = useSafeAreaInsets();
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
  }, [defaultValues, reset]);

  const onFormSubmit = (data: FormData) => {
    onSubmit({
      name: data.name.trim(),
      amount: Number(data.amount),
      category: data.category as Category,
      type: data.type as ExpenseType,
      frequency: data.frequency as Frequency,
      recurOnDate:
        data.frequency === "monthly"
          ? data.recurOnDate
          : isEdit
            ? null
            : undefined,
      startDate: data.startDate,
      notes: data.notes?.trim() || undefined,
    });
  };

  return (
    <View className="flex-1 bg-background">
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 24,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
        bottomOffset={Math.max(insets.bottom, 12) + 72}
      >
        <Text className="text-sm text-muted leading-snug mb-5">
          Auto-track repeating expenses or income on a schedule.
        </Text>

        <View className="gap-4">
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

          <View>
            <Label className="mb-2">Type</Label>
            <Controller
              control={control}
              name="type"
              render={({ field: { value, onChange } }) => (
                <View className="flex-row gap-2">
                  {EXPENSE_TYPES.map((t) => (
                    <Chip
                      key={t}
                      size="sm"
                      variant={value === t ? "primary" : "secondary"}
                      color={value === t ? "accent" : "default"}
                      onPress={() => onChange(t)}
                      className="flex-1"
                    >
                      <Chip.Label className="capitalize">{t}</Chip.Label>
                    </Chip>
                  ))}
                </View>
              )}
            />
          </View>

          <View>
            <Label className="mb-2">Category</Label>
            <Controller
              control={control}
              name="category"
              render={({ field: { value, onChange } }) => (
                <View className="flex-row flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <Chip
                      key={c}
                      size="sm"
                      variant={value === c ? "primary" : "secondary"}
                      color={value === c ? "accent" : "default"}
                      onPress={() => onChange(c)}
                    >
                      <Chip.Label className="capitalize">{c}</Chip.Label>
                    </Chip>
                  ))}
                </View>
              )}
            />
            {errors.category ? (
              <FieldError className="mt-1">{errors.category.message}</FieldError>
            ) : null}
          </View>

          <View>
            <Label className="mb-2">Frequency</Label>
            <Controller
              control={control}
              name="frequency"
              render={({ field: { value, onChange } }) => (
                <View className="flex-row flex-wrap gap-2">
                  {FREQUENCIES.map((f) => (
                    <Chip
                      key={f}
                      size="sm"
                      variant={value === f ? "primary" : "secondary"}
                      color={value === f ? "accent" : "default"}
                      onPress={() => onChange(f)}
                    >
                      <Chip.Label className="capitalize">{f}</Chip.Label>
                    </Chip>
                  ))}
                </View>
              )}
            />
          </View>

          {frequency === "monthly" ? (
            <View>
              <Label className="mb-2">Day of month</Label>
              <Controller
                control={control}
                name="recurOnDate"
                render={({ field: { value, onChange } }) => (
                  <View className="flex-row flex-wrap gap-2">
                    {DAYS.map((d) => (
                      <Chip
                        key={d}
                        size="sm"
                        variant={value === d ? "primary" : "secondary"}
                        color={value === d ? "accent" : "default"}
                        onPress={() => onChange(d)}
                      >
                        <Chip.Label>{String(d)}</Chip.Label>
                      </Chip>
                    ))}
                  </View>
                )}
              />
              <Description className="mt-2">
                Max day 28 — safe across all months.
              </Description>
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
                    <Description>Recurs every {weekdayHint(value)}</Description>
                  ) : null}
                  {frequency === "yearly" && value ? (
                    <Description>Recurs every year on this date</Description>
                  ) : null}
                  {frequency === "daily" && value ? (
                    <Description>Recurs daily from this date</Description>
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
                <TextArea
                  placeholder="Any notes…"
                  value={value}
                  onChangeText={onChange}
                  numberOfLines={3}
                />
              </TextField>
            )}
          />
        </View>
      </KeyboardAwareScrollView>

      <View
        className="flex-row gap-3 px-4 pt-3 border-t border-separator/60 bg-background"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        <Button variant="outline" onPress={onCancel} className="flex-1">
          <Button.Label>Cancel</Button.Label>
        </Button>
        <Button
          onPress={handleSubmit(onFormSubmit)}
          isDisabled={isPending}
          className="flex-1"
        >
          <Button.Label>
            {isPending ? "Saving…" : isEdit ? "Save" : "Create"}
          </Button.Label>
        </Button>
      </View>
    </View>
  );
}
