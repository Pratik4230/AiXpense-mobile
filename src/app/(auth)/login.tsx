import { useState } from "react";
import { View, Pressable, Text } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Ionicons } from "@expo/vector-icons";

import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  TextField,
  Input,
  Label,
  FieldError,
  Separator,
} from "heroui-native";
import { SafeAreaView } from "@/components/ui";
import { authClient } from "@/lib/authClient";

const schema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
            Welcome back
          </Text>
          <Text className="text-sm text-muted">
            Sign in to your AiXpense account
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

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <TextField isInvalid={!!errors.password}>
                <Label>Password</Label>
                <View className="relative">
                  <Input
                    placeholder="••••••••"
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry={!showPassword}
                    autoComplete="current-password"
                  />
                  <Pressable
                    onPress={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-0 bottom-0 justify-center"
                    hitSlop={8}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={18}
                      color="#9ca3af"
                    />
                  </Pressable>
                </View>
                <FieldError>{errors.password?.message}</FieldError>
              </TextField>
            )}
          />

          <Pressable
            onPress={() => router.push("/(auth)/forgot-password")}
            className="self-end"
          >
            <Text className="text-xs text-accent">Forgot password?</Text>
          </Pressable>

          {error ? <Text className="text-xs text-danger">{error}</Text> : null}

          <Button
            onPress={handleSubmit(onSubmit)}
            isDisabled={isSubmitting}
            className="mt-2"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </View>

        <Separator className="my-8" />

        <View className="flex-row justify-center gap-1">
          <Text className="text-sm text-muted">
            Don&apos;t have an account?
          </Text>
          <Pressable onPress={() => router.push("/(auth)/signup")}>
            <Text className="text-sm font-semibold text-accent">Sign up</Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
