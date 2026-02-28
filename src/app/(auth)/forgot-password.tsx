import { useState, useRef } from "react";
import { View, Pressable, Text, TextInput } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, TextField, Input, Label, FieldError } from "heroui-native";
import { SafeAreaView } from "@/components/ui";
import { authClient } from "@/lib/authClient";

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const passwordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don\u0027t match",
    path: ["confirmPassword"],
  });

type EmailData = z.infer<typeof emailSchema>;
type PasswordData = z.infer<typeof passwordSchema>;

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<"email" | "otp" | "reset" | "done">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const inputs = useRef<(TextInput | null)[]>([]);

  const emailForm = useForm<EmailData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const passwordForm = useForm<PasswordData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const handleSendOtp = async (data: EmailData) => {
    setError("");
    const result = await authClient.emailOtp.requestPasswordReset({
      email: data.email,
    });
    if (result.error) {
      setError(result.error.message ?? "Failed to send code");
      return;
    }
    setEmail(data.email);
    setStep("otp");
  };

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      const chars = value.slice(0, 6).split("");
      const newOtp = [...otp];
      chars.forEach((c, i) => {
        if (index + i < 6) newOtp[index + i] = c;
      });
      setOtp(newOtp);
      inputs.current[Math.min(index + chars.length, 5)]?.focus();
      return;
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
    }
  };

  const code = otp.join("");

  const handleVerifyOtp = async () => {
    setError("");
    const result = await authClient.emailOtp.checkVerificationOtp({
      email,
      otp: code,
      type: "forget-password",
    });
    if (result.error) {
      setError(result.error.message ?? "Invalid code");
      return;
    }
    setStep("reset");
  };

  const handleResetPassword = async (data: PasswordData) => {
    setError("");
    const result = await authClient.emailOtp.resetPassword({
      email,
      otp: code,
      password: data.password,
    });
    if (result.error) {
      setError(result.error.message ?? "Failed to reset password");
      return;
    }
    setStep("done");
  };

  const handleResend = async () => {
    setError("");
    await authClient.emailOtp.requestPasswordReset({ email });
  };

  if (step === "done") {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-6 gap-6">
          <Text className="text-3xl font-bold text-foreground">
            Password updated
          </Text>
          <Text className="text-sm text-muted text-center">
            Your password has been reset. You can now sign in.
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

  if (step === "reset") {
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
              New password
            </Text>
            <Text className="text-sm text-muted">
              Enter your new password below
            </Text>
          </View>

          <View className="gap-4">
            <Controller
              control={passwordForm.control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <TextField isInvalid={!!passwordForm.formState.errors.password}>
                  <Label>New Password</Label>
                  <Input
                    placeholder="••••••••"
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry
                    autoComplete="new-password"
                  />
                  <FieldError>
                    {passwordForm.formState.errors.password?.message}
                  </FieldError>
                </TextField>
              )}
            />
            <Controller
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <TextField
                  isInvalid={!!passwordForm.formState.errors.confirmPassword}
                >
                  <Label>Confirm Password</Label>
                  <Input
                    placeholder="••••••••"
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry
                  />
                  <FieldError>
                    {passwordForm.formState.errors.confirmPassword?.message}
                  </FieldError>
                </TextField>
              )}
            />
            {error ? (
              <Text className="text-xs text-danger">{error}</Text>
            ) : null}
            <Button
              onPress={passwordForm.handleSubmit(handleResetPassword)}
              isDisabled={passwordForm.formState.isSubmitting}
              className="mt-2"
            >
              {passwordForm.formState.isSubmitting
                ? "Resetting..."
                : "Reset Password"}
            </Button>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    );
  }

  if (step === "otp") {
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
          <Pressable onPress={() => setStep("email")} className="mb-8">
            <Text className="text-sm font-semibold text-accent">← Back</Text>
          </Pressable>

          <View className="mb-10">
            <Text className="text-3xl font-bold text-foreground mb-1">
              Enter code
            </Text>
            <Text className="text-sm text-muted">
              Enter the 6-digit code sent to{"\n"}
              <Text className="font-semibold text-foreground">{email}</Text>
            </Text>
          </View>

          <View className="flex-row justify-between gap-2 mb-6">
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={(ref) => {
                  inputs.current[i] = ref;
                }}
                value={digit}
                onChangeText={(v) => handleOtpChange(v, i)}
                onKeyPress={({ nativeEvent }) =>
                  handleOtpKeyPress(nativeEvent.key, i)
                }
                keyboardType="number-pad"
                maxLength={1}
                className="flex-1 h-14 rounded-xl bg-card text-center text-2xl font-bold text-foreground"
                style={{ fontSize: 24, borderWidth: 2, borderColor: "#71717a" }}
                cursorColor="#f97316"
              />
            ))}
          </View>

          {error ? (
            <Text className="text-xs text-danger mb-4">{error}</Text>
          ) : null}

          <Button
            onPress={handleVerifyOtp}
            isDisabled={code.length !== 6}
            className="mb-4"
          >
            Verify Code
          </Button>

          <View className="flex-row justify-center gap-1">
            <Text className="text-sm text-muted">
              Didn&apos;t receive the code?
            </Text>
            <Pressable onPress={handleResend}>
              <Text className="text-sm font-semibold text-accent">Resend</Text>
            </Pressable>
          </View>
        </KeyboardAwareScrollView>
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
            Enter your email and we&apos;ll send you a reset code
          </Text>
        </View>

        <View className="gap-4">
          <Controller
            control={emailForm.control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <TextField isInvalid={!!emailForm.formState.errors.email}>
                <Label>Email</Label>
                <Input
                  placeholder="you@example.com"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoComplete="email"
                />
                <FieldError>
                  {emailForm.formState.errors.email?.message}
                </FieldError>
              </TextField>
            )}
          />

          {error ? <Text className="text-xs text-danger">{error}</Text> : null}

          <Button
            onPress={emailForm.handleSubmit(handleSendOtp)}
            isDisabled={emailForm.formState.isSubmitting}
            className="mt-2"
          >
            {emailForm.formState.isSubmitting
              ? "Sending..."
              : "Send Reset Code"}
          </Button>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
