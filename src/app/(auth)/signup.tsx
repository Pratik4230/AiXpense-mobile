import { useState } from "react";
import { View, Pressable, Text } from "react-native";
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
import { authClient } from "@/lib/authClient";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthBrandHeader } from "@/components/auth/AuthBrandHeader";
import { AuthFormSurface } from "@/components/auth/AuthFormSurface";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
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
    <AuthShell centered>
      <AuthBrandHeader
        title="Create your account"
        subtitle="Track spending, set budgets, and chat with AI in one calm place."
      />

      <AuthFormSurface>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <TextField isInvalid={!!errors.name}>
              <Label>Full name</Label>
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
                autoCapitalize="none"
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
                placeholder="At least 8 characters"
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
              <Label>Confirm password</Label>
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
          className="mt-1"
        >
          {isSubmitting ? "Creating account..." : "Continue"}
        </Button>
      </AuthFormSurface>

      <Separator className="my-8 opacity-60" />

      <View className="flex-row justify-center gap-1.5 flex-wrap">
        <Text className="text-sm text-muted">Already have an account?</Text>
        <Pressable
          onPress={() => router.replace("/(auth)/login")}
          hitSlop={8}
        >
          <Text className="text-sm font-semibold text-accent">Sign in</Text>
        </Pressable>
      </View>
    </AuthShell>
  );
}
