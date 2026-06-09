import type { Category } from "@/constants/expense";
import { CATEGORIES } from "@/constants/expense";
import type { Budget } from "@/types/budget";
import { BottomSheet, Host, RNHostView } from "@expo/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Chip,
  FieldError,
  Input,
  Label,
  TextField,
} from "heroui-native";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { z } from "zod";

const schema = z.object({
  category: z.string().min(1, "Select a category"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) > 0,
      "Enter a positive amount",
    ),
});

type FormData = z.infer<typeof schema>;

export type BudgetSheetMode =
  | { type: "add" }
  | { type: "edit"; budget: Budget }
  | { type: "delete"; budget: Budget }
  | null;

interface Props {
  mode: BudgetSheetMode;
  onClose: () => void;
  existingCategories: string[];
  onCreate: (data: { category: Category; amount: number }) => void;
  onUpdate: (data: { id: string; amount: number }) => void;
  onDeleteConfirm: (budget: Budget) => void;
  isFormPending: boolean;
  isDeletePending: boolean;
  formatAmount: (amount: number, currency?: string) => string;
  limitCurrencyCode: string;
}

function BudgetFormContent({
  mode,
  onClose,
  existingCategories,
  onCreate,
  onUpdate,
  isFormPending,
  limitCurrencyCode,
}: {
  mode: Exclude<BudgetSheetMode, null | { type: "delete" }>;
  onClose: () => void;
  existingCategories: string[];
  onCreate: (data: { category: Category; amount: number }) => void;
  onUpdate: (data: { id: string; amount: number }) => void;
  isFormPending: boolean;
  limitCurrencyCode: string;
}) {
  const isEdit = mode.type === "edit";
  const budget = isEdit ? mode.budget : undefined;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: "", amount: "" },
  });

  useEffect(() => {
    reset({
      category: isEdit ? (budget?.category ?? "") : "",
      amount: budget?.amount ? String(budget.amount) : "",
    });
  }, [isEdit, budget?.category, budget?.amount, budget?._id, reset]);

  const availableCategories = CATEGORIES.filter(
    (c) => !existingCategories.includes(c) || c === budget?.category,
  );

  const onSubmit = (data: FormData) => {
    if (isEdit && budget) {
      onUpdate({ id: budget._id, amount: Number(data.amount) });
      return;
    }

    onCreate({
      category: data.category as Category,
      amount: Number(data.amount),
    });
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28 }}
      keyboardShouldPersistTaps="handled"
      bottomOffset={32}
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-xl font-bold text-foreground">
        {isEdit ? "Edit budget" : "Add budget"}
      </Text>
      <Text className="text-sm text-muted leading-snug mt-1 mb-5">
        {isEdit
          ? "Update your monthly limit for this category."
          : "Pick a category and set how much you plan to spend each month."}
      </Text>

      <View className="gap-4">
        {isEdit && budget ? (
          <View className="rounded-2xl border border-separator bg-default px-4 py-3">
            <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Category
            </Text>
            <Text className="text-lg font-semibold text-foreground capitalize mt-1">
              {budget.category}
            </Text>
            <Text className="text-xs text-muted mt-1.5 leading-snug">
              Category can&apos;t be changed. Create a new budget to use a
              different category.
            </Text>
          </View>
        ) : (
          <View>
            <Label className="mb-2">Category</Label>
            <Controller
              control={control}
              name="category"
              render={({ field: { value, onChange } }) => (
                <View className="flex-row flex-wrap gap-2">
                  {availableCategories.map((c) => (
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
              <FieldError className="mt-1">
                {errors.category.message}
              </FieldError>
            ) : null}
          </View>
        )}

        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, value } }) => (
            <TextField isInvalid={!!errors.amount}>
              <Label>Monthly limit ({limitCurrencyCode})</Label>
              <Input
                placeholder="e.g. 5000"
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
              />
              <FieldError>{errors.amount?.message}</FieldError>
            </TextField>
          )}
        />

        <View className="flex-row gap-3 pt-1">
          <Button variant="outline" onPress={onClose} className="flex-1">
            <Button.Label>Cancel</Button.Label>
          </Button>
          <Button
            onPress={handleSubmit(onSubmit)}
            isDisabled={isFormPending}
            className="flex-1"
          >
            <Button.Label>
              {isFormPending ? "Saving…" : isEdit ? "Update" : "Create"}
            </Button.Label>
          </Button>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}

function DeleteSheetContent({
  budget,
  onClose,
  onDeleteConfirm,
  isDeletePending,
  formatAmount,
}: {
  budget: Budget;
  onClose: () => void;
  onDeleteConfirm: (budget: Budget) => void;
  isDeletePending: boolean;
  formatAmount: (amount: number, currency?: string) => string;
}) {
  return (
    <View className="gap-5 px-5 pb-6 pt-1">
      <Text className="text-xl font-bold text-foreground">Delete budget?</Text>
      <Text className="text-sm text-muted leading-snug -mt-1">
        Remove the monthly {budget.category} budget of{" "}
        {formatAmount(budget.amount, budget.currency)}? This cannot be undone.
      </Text>
      <View className="flex-row gap-3">
        <Button
          variant="outline"
          onPress={onClose}
          className="flex-1"
          isDisabled={isDeletePending}
        >
          <Button.Label>Cancel</Button.Label>
        </Button>
        <Button
          variant="danger"
          onPress={() => onDeleteConfirm(budget)}
          className="flex-1"
          isDisabled={isDeletePending}
        >
          <Button.Label>
            {isDeletePending ? "Deleting…" : "Delete"}
          </Button.Label>
        </Button>
      </View>
    </View>
  );
}

export function BudgetsSheet({
  mode,
  onClose,
  existingCategories,
  onCreate,
  onUpdate,
  onDeleteConfirm,
  isFormPending,
  isDeletePending,
  formatAmount,
  limitCurrencyCode,
}: Props) {
  const isPresented = mode !== null;
  const isDelete = mode?.type === "delete";
  const budget = mode?.type === "delete" ? mode.budget : undefined;

  return (
    <Host matchContents>
      <BottomSheet
        isPresented={isPresented}
        onDismiss={onClose}
        snapPoints={isDelete ? undefined : ["half", "full"]}
        showDragIndicator
      >
        {isDelete && budget ? (
          <RNHostView matchContents>
            <DeleteSheetContent
              budget={budget}
              onClose={onClose}
              onDeleteConfirm={onDeleteConfirm}
              isDeletePending={isDeletePending}
              formatAmount={formatAmount}
            />
          </RNHostView>
        ) : mode && mode.type !== "delete" ? (
          <RNHostView matchContents>
            <BudgetFormContent
              key={mode.type === "edit" ? mode.budget._id : "add"}
              mode={mode}
              onClose={onClose}
              existingCategories={existingCategories}
              onCreate={onCreate}
              onUpdate={onUpdate}
              isFormPending={isFormPending}
              limitCurrencyCode={limitCurrencyCode}
            />
          </RNHostView>
        ) : null}
      </BottomSheet>
    </Host>
  );
}
