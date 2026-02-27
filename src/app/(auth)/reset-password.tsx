import { useState } from "react";
import { View, Text } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { router, useLocalSearchParams } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, TextField, Input, Label, FieldError } from "heroui-native";
import { SafeAreaView } from "@/components/ui";
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
          <Text className="text-3xl font-bold text-foreground">
            Password updated
          </Text>
          <Text className="text-sm text-muted text-center">
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
      <KeyboardAwareScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 24,
          paddingVertical: 40,
        }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={16}
      >
        <View className="mb-10">
          <Text className="text-3xl font-bold text-foreground mb-1">
            Reset password
          </Text>
          <Text className="text-sm text-muted">
            Enter your new password below
          </Text>
        </View>

        <View className="gap-4">
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <TextField isInvalid={!!errors.password}>
                <Label>New Password</Label>
                <Input
                  placeholder="••••••••"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  autoComplete="new-password"
                />
                <FieldError>{errors.password?.message}</FieldError>
              </TextField>
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <TextField isInvalid={!!errors.confirmPassword}>
                <Label>Confirm Password</Label>
                <Input
                  placeholder="••••••••"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                />
                <FieldError>{errors.confirmPassword?.message}</FieldError>
              </TextField>
            )}
          />

          {error ? <Text className="text-xs text-danger">{error}</Text> : null}

          <Button
            onPress={handleSubmit(onSubmit)}
            isDisabled={isSubmitting}
            className="mt-2"
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </Button>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
