import { useState, useRef } from "react";
import { View, Text, TextInput, Pressable, useColorScheme } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button, useThemeColor } from "heroui-native";
import { authClient, signIn } from "@/lib/authClient";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthBrandHeader } from "@/components/auth/AuthBrandHeader";
import { AuthFormSurface } from "@/components/auth/AuthFormSurface";

export default function VerifyEmailScreen() {
  const { email, password } = useLocalSearchParams<{
    email: string;
    password: string;
  }>();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    if (value.length > 1) {
      const chars = value.slice(0, 6).split("");
      const newOtp = [...otp];
      chars.forEach((c, i) => {
        if (index + i < 6) newOtp[index + i] = c;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + chars.length, 5);
      inputs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
    }
  };

  const code = otp.join("");

  const handleVerify = async () => {
    if (!email || code.length !== 6) return;
    setError("");
    setIsLoading(true);

    const result = await authClient.emailOtp.verifyEmail({
      email,
      otp: code,
    });

    if (result.error) {
      setError(result.error.message ?? "Invalid code");
      setIsLoading(false);
      return;
    }

    if (password) {
      const signedIn = await signIn.email({ email, password });
      if (!signedIn.error) {
        router.replace("/");
        setIsLoading(false);
        return;
      }
    }
    router.replace("/login");
    setIsLoading(false);
  };

  const handleResend = async () => {
    if (!email) return;
    setError("");
    await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "email-verification",
    });
  };

  const isDark = useColorScheme() === "dark";
  const [accentColor, borderColor] = useThemeColor(["accent", "separator"]);

  return (
    <AuthShell showBack onBack={() => router.back()}>
      <AuthBrandHeader
        title="Verify your email"
        subtitle={`Enter the 6-digit code we sent to ${email ?? "your inbox"}.`}
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
              onChangeText={(v) => handleChange(v, i)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, i)
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

        <Button
          onPress={handleVerify}
          isDisabled={isLoading || code.length !== 6}
        >
          {isLoading ? "Verifying..." : "Verify email"}
        </Button>

        <View className="flex-row justify-center gap-1 pt-1">
          <Text className="text-sm text-muted">
            Didn&apos;t receive the code?
          </Text>
          <Pressable onPress={handleResend}>
            <Text className="text-sm font-semibold text-accent">Resend</Text>
          </Pressable>
        </View>
      </AuthFormSurface>
    </AuthShell>
  );
}
