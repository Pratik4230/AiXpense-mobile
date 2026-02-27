import { useState } from "react";
import { View, Pressable, Text } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, TextField, Input, Label, FieldError } from "heroui-native";
import { SafeAreaView } from "@/components/ui";
import { authClient } from "@/lib/authClient";

const schema = z.object({
  email: z.email("Invalid email address"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    const result = await authClient.requestPasswordReset({
      email: data.email,
      redirectTo: "aixpensemobile://reset-password",
    });
    if (result.error) {
      setError(result.error.message ?? "Failed to send reset email");
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-6 gap-6">
          <View className="gap-3 items-center">
            <Text className="text-3xl font-bold text-foreground">
              Check your inbox
            </Text>
            <Text className="text-sm text-muted text-center">
              A password reset link has been sent to your email. Follow the link
              to set a new password.
            </Text>
          </View>
          <Button
            variant="outline"
            onPress={() => router.back()}
            className="w-full mt-4"
          >
            Back to Sign In
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
        <Pressable onPress={() => router.back()} className="mb-8">
          <Text className="text-sm font-semibold text-accent">← Back</Text>
        </Pressable>

        <View className="mb-10">
          <Text className="text-3xl font-bold text-foreground mb-1">
            Forgot password?
          </Text>
          <Text className="text-sm text-muted">
            Enter your email and we&apos;ll send you a reset link
          </Text>
        </View>

        <View className="gap-4">
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <TextField isInvalid={!!errors.email}>
                <Label>Email</Label>
                <Input
                  placeholder="you@example.com"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoComplete="email"
                />
                <FieldError>{errors.email?.message}</FieldError>
              </TextField>
            )}
          />

          {error ? <Text className="text-xs text-danger">{error}</Text> : null}

          <Button
            onPress={handleSubmit(onSubmit)}
            isDisabled={isSubmitting}
            className="mt-2"
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </Button>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
