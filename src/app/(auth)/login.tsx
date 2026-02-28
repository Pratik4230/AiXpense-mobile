import { useState, useRef } from "react";
import { View, Pressable, Text, TextInput } from "react-native";
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
  const [needsVerification, setNeedsVerification] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const otpInputs = useRef<(TextInput | null)[]>([]);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    setNeedsVerification(false);
    const result = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    });
    if (result.error) {
      if (result.error.status === 403) {
        setNeedsVerification(true);
      } else {
        setError(result.error.message ?? "Login failed");
      }
    }
  };

  const handleSendOtp = async () => {
    setError("");
    await authClient.emailOtp.sendVerificationOtp({
      email: getValues("email"),
      type: "email-verification",
    });
    setOtpSent(true);
  };

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      const chars = value.slice(0, 6).split("");
      const newOtp = [...otp];
      chars.forEach((c, i) => {
        if (index + i < 6) newOtp[index + i] = c;
      });
      setOtp(newOtp);
      otpInputs.current[Math.min(index + chars.length, 5)]?.focus();
      return;
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpInputs.current[index + 1]?.focus();
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
    }
  };

  const handleVerifyAndSignIn = async () => {
    const code = otp.join("");
    const email = getValues("email");
    const password = getValues("password");
    setError("");
    setVerifying(true);

    const verifyResult = await authClient.emailOtp.verifyEmail({
      email,
      otp: code,
    });

    if (verifyResult.error) {
      setError(verifyResult.error.message ?? "Invalid code");
      setVerifying(false);
      return;
    }

    const signInResult = await authClient.signIn.email({ email, password });
    if (signInResult.error) {
      setError(signInResult.error.message ?? "Sign in failed");
      setVerifying(false);
    }
  };

  const otpCode = otp.join("");

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

          {needsVerification && (
            <View className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 gap-3">
              <Text className="text-sm font-medium text-foreground">
                Email not verified
              </Text>
              {otpSent ? (
                <View className="gap-3">
                  <Text className="text-xs text-muted">
                    Enter the 6-digit code sent to your email
                  </Text>
                  {error ? (
                    <Text className="text-xs text-danger">{error}</Text>
                  ) : null}
                  <View className="flex-row justify-between gap-2">
                    {otp.map((digit, i) => (
                      <TextInput
                        key={i}
                        ref={(ref) => {
                          otpInputs.current[i] = ref;
                        }}
                        value={digit}
                        onChangeText={(v) => handleOtpChange(v, i)}
                        onKeyPress={({ nativeEvent }) =>
                          handleOtpKeyPress(nativeEvent.key, i)
                        }
                        keyboardType="number-pad"
                        maxLength={1}
                        className="flex-1 h-12 rounded-lg bg-card text-center text-xl font-bold text-foreground"
                        style={{
                          fontSize: 20,
                          borderWidth: 2,
                          borderColor: "#71717a",
                        }}
                        cursorColor="#f97316"
                      />
                    ))}
                  </View>
                  <Button
                    onPress={handleVerifyAndSignIn}
                    isDisabled={verifying || otpCode.length !== 6}
                    size="sm"
                  >
                    {verifying ? "Verifying..." : "Verify & Sign In"}
                  </Button>
                </View>
              ) : (
                <Button onPress={handleSendOtp} variant="outline" size="sm">
                  Send verification code
                </Button>
              )}
            </View>
          )}

          {error && !needsVerification ? (
            <Text className="text-xs text-danger">{error}</Text>
          ) : null}

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
