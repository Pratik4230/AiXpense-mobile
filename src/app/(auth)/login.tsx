import { useState, useRef } from "react";
import { View, Pressable, Text, TextInput, useColorScheme } from "react-native";
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
  useThemeColor,
} from "heroui-native";
import { authClient } from "@/lib/authClient";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthBrandHeader } from "@/components/auth/AuthBrandHeader";
import { AuthFormSurface } from "@/components/auth/AuthFormSurface";

const schema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "github" | null>(
    null,
  );
  const [needsVerification, setNeedsVerification] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const otpInputs = useRef<(TextInput | null)[]>([]);
  const isDark = useColorScheme() === "dark";
  const [mutedColor, accentColor, borderColor] = useThemeColor([
    "muted",
    "accent",
    "separator",
  ]);

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

  const handleSocialSignIn = async (provider: "google" | "github") => {
    setError("");
    setNeedsVerification(false);
    setSocialLoading(provider);
    const result = await authClient.signIn.social({
      provider,
      // Required on Expo native so OAuth returns to app scheme instead of web.
      callbackURL: "/",
    });
    if (result.error) {
      setError(result.error.message ?? `Failed to sign in with ${provider}`);
    }
    setSocialLoading(null);
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
    <AuthShell centered>
      <AuthBrandHeader
        title="Welcome back"
        subtitle="Sign in to sync expenses, budgets, and AI chat across your devices."
      />

      <AuthFormSurface>
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
                  accessibilityLabel={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={mutedColor}
                  />
                </Pressable>
              </View>
              <FieldError>{errors.password?.message}</FieldError>
            </TextField>
          )}
        />

        <Pressable
          onPress={() => router.push("/forgot-password")}
          className="self-end -mt-1"
          hitSlop={8}
        >
          <Text className="text-sm font-medium text-accent">
            Forgot password?
          </Text>
        </Pressable>

        {needsVerification && (
          <View className="rounded-2xl border border-warning/35 bg-warning/10 p-4 gap-3">
            <Text className="text-sm font-semibold text-foreground">
              Email not verified
            </Text>
            {otpSent ? (
              <View className="gap-3">
                <Text className="text-xs text-muted leading-relaxed">
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
                      className="flex-1 h-12 rounded-xl bg-default text-center text-lg font-semibold text-foreground"
                      style={{
                        fontSize: 18,
                        borderWidth: 1.5,
                        borderColor: isDark
                          ? "rgba(255,255,255,0.12)"
                          : borderColor,
                      }}
                      cursorColor={accentColor}
                    />
                  ))}
                </View>
                <Button
                  onPress={handleVerifyAndSignIn}
                  isDisabled={verifying || otpCode.length !== 6}
                  size="sm"
                >
                  {verifying ? "Verifying..." : "Verify & sign in"}
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
          className="mt-1"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>

        <View className="flex-row items-center gap-3 my-2">
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
              <Ionicons name="logo-google" size={18} color={accentColor} />
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
              <Ionicons name="logo-github" size={18} color={accentColor} />
              <Text className="text-sm font-medium text-foreground">
                {socialLoading === "github" ? "Connecting..." : "Continue with GitHub"}
              </Text>
            </View>
          </Button>
        </View>
      </AuthFormSurface>

      <Separator className="my-8 opacity-60" />

      <View className="flex-row justify-center gap-1.5 flex-wrap">
        <Text className="text-sm text-muted">New to AiXpense?</Text>
        <Pressable onPress={() => router.push("/signup")} hitSlop={8}>
          <Text className="text-sm font-semibold text-accent">Create account</Text>
        </Pressable>
      </View>
    </AuthShell>
  );
}
