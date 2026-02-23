import { useState } from "react";
import { View, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Text, SafeAreaView } from "@/components/ui";
import { authClient } from "@/lib/authClient";

const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don&apos;t match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: FormData) => {
    if (!token) {
      setError("Invalid or expired reset link");
      return;
    }
    setError("");
    const result = await authClient.resetPassword({
      newPassword: data.password,
      token,
    });
    if (result.error) {
      setError(result.error.message ?? "Failed to reset password");
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-6 gap-6">
          <Text variant="heading">Password updated</Text>
          <Text variant="muted" className="text-center">
            Your password has been reset. You can now sign in with your new
            password.
          </Text>
          <Button
            onPress={() => router.replace("/(auth)/login")}
            className="w-full mt-4"
          >
            Sign In
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-10"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-10">
          <Text variant="heading" className="mb-1">
            Reset password
          </Text>
          <Text variant="muted">Enter your new password below</Text>
        </View>

        <View className="gap-4">
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                label="New Password"
                placeholder="••••••••"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                autoComplete="new-password"
                error={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Confirm Password"
                placeholder="••••••••"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                error={errors.confirmPassword?.message}
              />
            )}
          />

          {error ? (
            <Text variant="caption" className="text-destructive">
              {error}
            </Text>
          ) : null}

          <Button
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            className="mt-2"
          >
            Reset Password
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
