import { useState } from "react";
import { View, Pressable, Text } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
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

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don&apos;t match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function SignupScreen() {
  const [error, setError] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    const result = await authClient.signUp.email({
      name: data.name,
      email: data.email,
      password: data.password,
    });
    if (result.error) {
      setError(result.error.message ?? "Registration failed");
      return;
    }
    router.push({
      pathname: "/(auth)/verify-email",
      params: { email: data.email, password: data.password },
    });
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
            Create account
          </Text>
          <Text className="text-sm text-muted">
            Start tracking your expenses with AI
          </Text>
        </View>

        <View className="gap-4">
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <TextField isInvalid={!!errors.name}>
                <Label>Full Name</Label>
                <Input
                  placeholder="John Doe"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="words"
                  autoComplete="name"
                />
                <FieldError>{errors.name?.message}</FieldError>
              </TextField>
            )}
          />

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
            {isSubmitting ? "Creating..." : "Create Account"}
          </Button>
        </View>

        <Separator className="my-8" />

        <View className="flex-row justify-center gap-1">
          <Text className="text-sm text-muted">Already have an account?</Text>
          <Pressable onPress={() => router.back()}>
            <Text className="text-sm font-semibold text-accent">Sign in</Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
