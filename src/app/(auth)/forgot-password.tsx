import { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Text, SafeAreaView } from "@/components/ui";
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
            <Text variant="heading">Check your inbox</Text>
            <Text variant="muted" className="text-center">
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
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-10"
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()} className="mb-8">
          <Text variant="label" className="text-primary">
            ← Back
          </Text>
        </Pressable>

        <View className="mb-10">
          <Text variant="heading" className="mb-1">
            Forgot password?
          </Text>
          <Text variant="muted">
            Enter your email and we&apos;ll send you a reset link
          </Text>
        </View>

        <View className="gap-4">
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Email"
                placeholder="you@example.com"
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                autoComplete="email"
                error={errors.email?.message}
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
            Send Reset Link
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
