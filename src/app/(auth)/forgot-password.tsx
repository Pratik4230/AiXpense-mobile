import { useState, useRef } from "react";
import { View, Pressable, Text, TextInput, useColorScheme } from "react-native";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, TextField, Input, Label, FieldError, useThemeColor } from "heroui-native";
import { authClient } from "@/lib/authClient";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthBrandHeader } from "@/components/auth/AuthBrandHeader";
import { AuthFormSurface } from "@/components/auth/AuthFormSurface";

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
  const isDark = useColorScheme() === "dark";
  const [accentColor, borderColor] = useThemeColor(["accent", "separator"]);

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
      <AuthShell centered>
        <View className="items-center gap-2 mb-8">
          <Text className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
            AiXpense
          </Text>
          <Text className="text-[28px] font-bold text-foreground text-center tracking-tight">
            Password updated
          </Text>
          <Text className="text-[15px] text-muted text-center leading-relaxed px-2">
            You can sign in with your new password.
          </Text>
        </View>
        <Button onPress={() => router.replace("/(auth)/login")} className="w-full">
          Sign in
        </Button>
      </AuthShell>
    );
  }

  if (step === "reset") {
    return (
      <AuthShell showBack onBack={() => setStep("otp")}>
        <AuthBrandHeader
          title="Choose a new password"
          subtitle="Use at least 8 characters you haven&apos;t used here before."
        />
        <AuthFormSurface>
          <Controller
            control={passwordForm.control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <TextField isInvalid={!!passwordForm.formState.errors.password}>
                <Label>New password</Label>
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
                <Label>Confirm password</Label>
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
            className="mt-1"
          >
            {passwordForm.formState.isSubmitting
              ? "Saving..."
              : "Update password"}
          </Button>
        </AuthFormSurface>
      </AuthShell>
    );
  }

  if (step === "otp") {
    return (
      <AuthShell showBack onBack={() => setStep("email")}>
        <AuthBrandHeader
          title="Enter the code"
          subtitle={`We sent a 6-digit code to ${email}.`}
        />
        <AuthFormSurface>
          <View className="flex-row justify-between gap-2">
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
                className="flex-1 h-[52px] rounded-2xl bg-default text-center text-2xl font-semibold text-foreground"
                style={{
                  fontSize: 22,
                  borderWidth: 1.5,
                  borderColor: isDark ? "rgba(255,255,255,0.12)" : borderColor,
                }}
                cursorColor={accentColor}
              />
            ))}
          </View>

          {error ? (
            <Text className="text-xs text-danger">{error}</Text>
          ) : null}

          <Button onPress={handleVerifyOtp} isDisabled={code.length !== 6}>
            Verify code
          </Button>

          <View className="flex-row justify-center gap-1 pt-1">
            <Text className="text-sm text-muted">Didn&apos;t get it?</Text>
            <Pressable onPress={handleResend}>
              <Text className="text-sm font-semibold text-accent">Resend</Text>
            </Pressable>
          </View>
        </AuthFormSurface>
      </AuthShell>
    );
  }

  return (
    <AuthShell showBack onBack={() => router.back()}>
      <AuthBrandHeader
        title="Reset password"
        subtitle="We&apos;ll email you a short code to confirm it&apos;s you."
      />
      <AuthFormSurface>
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
                autoCapitalize="none"
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
          className="mt-1"
        >
          {emailForm.formState.isSubmitting ? "Sending..." : "Send code"}
        </Button>
      </AuthFormSurface>
    </AuthShell>
  );
}
