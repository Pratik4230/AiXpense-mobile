import { View, Text } from "react-native";
import { router } from "expo-router";
import { Button } from "heroui-native";
import { SafeAreaView } from "@/components/ui";

export default function VerifyEmailScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6 gap-6">
        <View className="w-20 h-20 rounded-full bg-accent-soft items-center justify-center">
          <Text className="text-4xl">✉️</Text>
        </View>

        <View className="items-center gap-2">
          <Text className="text-2xl font-bold text-foreground">
            Verify your email
          </Text>
          <Text className="text-sm text-muted text-center">
            We&apos;ve sent a verification link to your email address. Click the
            link to activate your account, then sign in.
          </Text>
        </View>

        <Button
          variant="outline"
          onPress={() => router.replace("/(auth)/login")}
          className="w-full mt-4"
        >
          Back to Sign In
        </Button>
      </View>
    </SafeAreaView>
  );
}
