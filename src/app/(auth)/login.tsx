import { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";

import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SafeAreaView, Button, Input, Text, Separator } from "@/components/ui";
import { authClient } from "@/lib/authClient";

const schema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const [error, setError] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    const result = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    });
    if (result.error) {
      setError(result.error.message ?? "Login failed");
    }
  };

  return (
    <SafeAreaView className="flex-1  bg-background">
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-10"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-10">
          <Text variant="heading" className="mb-1">
            Welcome back
          </Text>
          <Text variant="muted">Sign in to your AiXpense account</Text>
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

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Password"
                placeholder="••••••••"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                autoComplete="current-password"
                error={errors.password?.message}
              />
            )}
          />

          <Pressable
            onPress={() => router.push("/(auth)/forgot-password")}
            className="self-end"
          >
            <Text variant="caption" className="text-primary">
              Forgot password?
            </Text>
          </Pressable>

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
            Sign In
          </Button>
        </View>

        <Separator className="my-8" />

        <View className="flex-row justify-center gap-1">
          <Text variant="muted">Don&apos;t have an account?</Text>
          <Pressable onPress={() => router.push("/(auth)/signup")}>
            <Text variant="label" className="text-primary">
              Sign up
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
