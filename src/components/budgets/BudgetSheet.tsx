import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { View, Pressable, Text } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  BottomSheet,
  Button,
  TextField,
  Input,
  Label,
  FieldError,
} from "heroui-native";
import { CATEGORIES } from "@/constants/expense";
import { useCreateBudget, useUpdateBudget } from "@/services/budgets";
import type { Budget } from "@/types/budget";
import type { Category } from "@/constants/expense";

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

export interface BudgetSheetRef {
  open: () => void;
}

interface Props {
  existing?: Budget;
  existingCategories: string[];
  onClose?: () => void;
}

export const BudgetSheet = forwardRef<BudgetSheetRef, Props>(
  ({ existing, existingCategories, onClose }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const isEdit = !!existing;
    const createMutation = useCreateBudget();
    const updateMutation = useUpdateBudget();
    const isPending = createMutation.isPending || updateMutation.isPending;

    useImperativeHandle(ref, () => ({
      open: () => setIsOpen(true),
    }));

    const {
      control,
      handleSubmit,
      reset,
      setValue,
      watch,
      formState: { errors },
    } = useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {
        category: existing?.category ?? "",
        amount: existing?.amount ? String(existing.amount) : "",
      },
    });

    useEffect(() => {
      reset({
        category: existing?.category ?? "",
        amount: existing?.amount ? String(existing.amount) : "",
      });
    }, [existing?.category, existing?.amount, reset]);

    const selectedCategory = watch("category");

    const availableCategories = CATEGORIES.filter(
      (c) => !existingCategories.includes(c) || c === existing?.category,
    );

    const handleOpenChange = (value: boolean) => {
      setIsOpen(value);
      if (!value) onClose?.();
    };

    const onSubmit = (data: FormData) => {
      if (isEdit) {
        updateMutation.mutate(
          { id: existing!._id, amount: Number(data.amount) },
          { onSuccess: () => handleOpenChange(false) },
        );
      } else {
        createMutation.mutate(
          { category: data.category as Category, amount: Number(data.amount) },
          {
            onSuccess: () => {
              reset({ category: "", amount: "" });
              handleOpenChange(false);
            },
          },
        );
      }
    };

    return (
      <BottomSheet isOpen={isOpen} onOpenChange={handleOpenChange}>
        <BottomSheet.Portal>
          <BottomSheet.Overlay />
          <BottomSheet.Content snapPoints={["60%", "85%"]}>
            <BottomSheet.Title>
              {isEdit ? "Edit budget" : "Add budget"}
            </BottomSheet.Title>
            <Text className="text-sm text-muted leading-snug -mt-1 mb-1">
              {isEdit
                ? "Update your monthly limit for this category."
                : "Pick a category and set how much you plan to spend each month."}
            </Text>

            <View className="gap-5 mt-3">
              {isEdit && existing && (
                <View className="rounded-2xl border border-separator bg-default px-4 py-3">
                  <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Category
                  </Text>
                  <Text className="text-lg font-semibold text-foreground capitalize mt-1">
                    {existing.category}
                  </Text>
                  <Text className="text-xs text-muted mt-1.5 leading-snug">
                    Category can&apos;t be changed. Create a new budget to use a
                    different category.
                  </Text>
                </View>
              )}

              {!isEdit && (
                <Controller
                  control={control}
                  name="category"
                  render={() => (
                    <View className="gap-2">
                      <Text className="text-sm font-medium text-foreground">
                        Category
                      </Text>
                      <View className="flex-row flex-wrap gap-2">
                        {availableCategories.map((c) => {
                          const isSelected = selectedCategory === c;
                          return (
                            <Pressable
                              key={c}
                              onPress={() =>
                                setValue("category", c, {
                                  shouldValidate: true,
                                })
                              }
                              className={`px-3 py-2 rounded-2xl border-[1.5px] ${
                                isSelected
                                  ? "border-accent bg-accent-soft"
                                  : "border-separator bg-transparent"
                              }`}
                            >
                              <Text
                                className={`text-xs capitalize ${
                                  isSelected
                                    ? "text-accent font-semibold"
                                    : "text-foreground"
                                }`}
                              >
                                {c}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                      {errors.category && (
                        <Text className="text-xs text-danger">
                          {errors.category.message}
                        </Text>
                      )}
                    </View>
                  )}
                />
              )}

              <Controller
                control={control}
                name="amount"
                render={({ field: { onChange, value } }) => (
                  <TextField isInvalid={!!errors.amount}>
                    <Label>Monthly limit (₹)</Label>
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

              <View className="flex-row gap-3">
                <Button
                  variant="outline"
                  onPress={() => handleOpenChange(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onPress={handleSubmit(onSubmit)}
                  isDisabled={isPending}
                  className="flex-1"
                >
                  {isPending ? "Saving..." : isEdit ? "Update" : "Create"}
                </Button>
              </View>
            </View>
          </BottomSheet.Content>
        </BottomSheet.Portal>
      </BottomSheet>
    );
  },
);

BudgetSheet.displayName = "BudgetSheet";
