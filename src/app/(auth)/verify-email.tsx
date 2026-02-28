import { useState, useRef } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { router, useLocalSearchParams } from "expo-router";
import { Button } from "heroui-native";
import { SafeAreaView } from "@/components/ui";
import { authClient, signIn } from "@/lib/authClient";

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
      await signIn.email({ email, password });
    }
    router.replace("/(auth)/login");
  };

  const handleResend = async () => {
    if (!email) return;
    setError("");
    await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "email-verification",
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
        <Pressable onPress={() => router.back()} className="mb-8">
          <Text className="text-sm font-semibold text-accent">← Back</Text>
        </Pressable>

        <View className="mb-10">
          <Text className="text-3xl font-bold text-foreground mb-1">
            Verify your email
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
              onChangeText={(v) => handleChange(v, i)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, i)
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
          onPress={handleVerify}
          isDisabled={isLoading || code.length !== 6}
          className="mb-4"
        >
          {isLoading ? "Verifying..." : "Verify Email"}
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
