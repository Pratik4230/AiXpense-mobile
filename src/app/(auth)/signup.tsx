import { useState } from "react";
import { View, Pressable, Text, useColorScheme } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
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
import { SocialProviderIcon } from "@/components/auth/SocialProviderIcon";

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
  const [socialLoading, setSocialLoading] = useState<"google" | "github" | null>(
    null,
  );
  const isDark = useColorScheme() === "dark";

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
    console.log("[auth][signup] submit:start", { email: data.email });
    const result = await authClient.signUp.email({
      name: data.name,
      email: data.email,
      password: data.password,
    });
    console.log("[auth][signup] submit:result", {
      hasError: Boolean(result.error),
      error: result.error?.message,
    });
    if (result.error) {
      setError(result.error.message ?? "Registration failed");
      return;
    }
    console.log("[auth][signup] navigation:replace", {
      to: "/verify-email",
      email: data.email,
    });
    router.replace(`/verify-email?email=${encodeURIComponent(data.email)}`);
  };

  const handleSocialSignIn = async (provider: "google" | "github") => {
    setError("");
    setSocialLoading(provider);
    const result = await authClient.signIn.social({
      provider,
      // Required on Expo native so OAuth returns to app scheme instead of web.
      callbackURL: "/",
    });
    if (result.error) {
      setError(result.error.message ?? `Failed to continue with ${provider}`);
    }
    setSocialLoading(null);
  };

  return (
    <AuthShell topPadding={10}>
      <AuthBrandHeader
        title="Create your account"
        subtitle="Track spending, set budgets, and chat with AI in one calm place."
        compact
      />

      <AuthFormSurface>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <TextField isInvalid={!!errors.name}>
              <Label>Full name</Label>
              <Input
                placeholder="Enter your full name"
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
                placeholder="Enter your email"
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

        <View className="flex-row items-center gap-3 my-1.5">
          <Separator className="flex-1 opacity-50" />
          <Text className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
            Or continue with
          </Text>
          <Separator className="flex-1 opacity-50" />
        </View>

        <View className="gap-2">
          <Button
            variant="outline"
            onPress={() => handleSocialSignIn("google")}
            isDisabled={socialLoading !== null}
          >
            <View className="flex-row items-center gap-2">
              <SocialProviderIcon provider="google" size={18} />
              <Text className="text-sm font-medium text-foreground">
                {socialLoading === "google" ? "Connecting..." : "Continue with Google"}
              </Text>
            </View>
          </Button>
          <Button
            variant="outline"
            onPress={() => handleSocialSignIn("github")}
            isDisabled={socialLoading !== null}
          >
            <View className="flex-row items-center gap-2">
              <Ionicons
                name="logo-github"
                size={18}
                color={isDark ? "#F0F6FC" : "#24292F"}
              />
              <Text className="text-sm font-medium text-foreground">
                {socialLoading === "github" ? "Connecting..." : "Continue with GitHub"}
              </Text>
            </View>
          </Button>
        </View>
      </AuthFormSurface>

      <Separator className="my-5 opacity-60" />

      <View className="flex-row justify-center gap-1.5 flex-wrap">
        <Text className="text-sm text-muted">Already have an account?</Text>
        <Pressable
          onPress={() => router.replace("/login")}
          hitSlop={8}
        >
          <Text className="text-sm font-semibold text-accent">Sign in</Text>
        </Pressable>
      </View>
    </AuthShell>
  );
}
