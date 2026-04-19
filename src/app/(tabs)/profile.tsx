import { useState } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import {
  Avatar,
  Button,
  Card,
  TextField,
  Input,
  Label,
  useThemeColor,
} from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSession, authClient } from "@/lib/authClient";
import { api } from "@/lib/api";
import { SafeAreaView } from "@/components/ui";
import { ReportIssueSheet } from "@/components/profile/ReportIssueSheet";
import { MyIssuesList } from "@/components/profile/MyIssuesList";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const MAX_FREE_TRIALS = 7;
const WEB_PROFILE_URL = "https://aixpense.in/profile";

const SECTION_LABEL =
  "text-[11px] font-semibold text-muted uppercase tracking-[0.14em]";

export default function ProfileScreen() {
  const { data: session, isPending: sessionLoading } = useSession();
  const user = session?.user as any;
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 20) + 8;

  const [accentColor, mutedColor] = useThemeColor(["accent", "muted"]);

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [nameError, setNameError] = useState("");
  const [nameSaving, setNameSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  const [showReportSheet, setShowReportSheet] = useState(false);
  const [showMyIssues, setShowMyIssues] = useState(false);

  const handleSaveName = async () => {
    if (!nameValue.trim()) {
      setNameError("Name is required");
      return;
    }
    setNameSaving(true);
    setNameError("");
    const { error } = await authClient.updateUser({ name: nameValue.trim() });
    setNameSaving(false);
    if (error) {
      setNameError(error.message ?? "Failed to update name");
    } else {
      setEditingName(false);
    }
  };

  const handleChangePassword = async () => {
    setPwError("");
    setPwSuccess(false);
    if (newPassword.length < 8) {
      setPwError("Min. 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match");
      return;
    }
    setPwLoading(true);
    try {
      await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });
      setPwSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      setPwError(e?.message ?? "Failed to change password");
    } finally {
      setPwLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign out?", "You will be returned to the login screen.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await authClient.signOut();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete account?",
      "This is irreversible. All your expenses, budgets, and data will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete("/api/user");
              await authClient.signOut();
            } catch {
              Alert.alert("Error", "Failed to delete account. Try again.");
            }
          },
        },
      ],
    );
  };

  if (sessionLoading || !user) {
    return (
      <SafeAreaView
        className="flex-1 bg-background items-center justify-center"
        edges={["top"]}
      >
        <ActivityIndicator size="large" color={accentColor} />
        <Text className="text-sm text-muted mt-4">Loading profile…</Text>
      </SafeAreaView>
    );
  }

  const isPremium = user.isPremium ?? false;
  const freeTrials = user.freeTrials ?? 0;
  const trialPercent = Math.min((freeTrials / MAX_FREE_TRIALS) * 100, 100);

  const legalLinks = [
    { label: "Privacy Policy", url: "https://aixpense.in/privacy" },
    { label: "Terms & Conditions", url: "https://aixpense.in/terms" },
    { label: "Refund Policy", url: "https://aixpense.in/refund" },
    { label: "Contact Us", url: "https://aixpense.in/contact" },
  ] as const;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: bottomPad,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="pt-2 pb-5">
          <Text className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted mb-1">
            AiXpense
          </Text>
          <Text className="text-2xl font-bold text-foreground tracking-tight">
            Profile
          </Text>
          <Text className="text-sm text-muted mt-1 leading-snug">
            Account, plan, and app feedback
          </Text>
        </View>

        <Card className="mb-4 rounded-3xl border border-separator overflow-hidden">
          <Card.Body className="gap-5 py-5">
            <View className="flex-row items-center gap-4">
              <Avatar size="lg" color="accent" variant="soft" alt={user.name}>
                <Avatar.Fallback>{getInitials(user.name)}</Avatar.Fallback>
              </Avatar>

              <View className="flex-1 min-w-0">
                {editingName ? (
                  <View className="gap-2">
                    <TextField isInvalid={!!nameError}>
                      <Input
                        value={nameValue}
                        onChangeText={setNameValue}
                        autoFocus
                        placeholder="Your name"
                      />
                    </TextField>
                    {nameError ? (
                      <Text className="text-xs text-danger">{nameError}</Text>
                    ) : null}
                    <View className="flex-row gap-2">
                      <Button
                        size="sm"
                        onPress={handleSaveName}
                        isDisabled={nameSaving}
                        className="flex-1"
                      >
                        {nameSaving ? "Saving…" : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onPress={() => {
                          setEditingName(false);
                          setNameError("");
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </View>
                  </View>
                ) : (
                  <View className="flex-row items-center gap-2">
                    <Text
                      className="text-lg font-semibold text-foreground flex-1"
                      numberOfLines={1}
                    >
                      {user.name}
                    </Text>
                    <Pressable
                      onPress={() => {
                        setNameValue(user.name);
                        setEditingName(true);
                      }}
                      hitSlop={10}
                      className="p-2 rounded-full bg-default active:opacity-70"
                      accessibilityLabel="Edit name"
                    >
                      <Ionicons
                        name="pencil-outline"
                        size={16}
                        color={mutedColor}
                      />
                    </Pressable>
                  </View>
                )}
                <Text className="text-sm text-muted mt-0.5" numberOfLines={2}>
                  {user.email}
                </Text>
              </View>
            </View>
          </Card.Body>
        </Card>

        <Card className="mb-4 rounded-3xl border border-separator overflow-hidden">
          <Card.Body className="gap-4 py-5">
            <Text className={SECTION_LABEL}>Plan & usage</Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-muted">Current plan</Text>
              <View className="flex-row items-center gap-1.5">
                {isPremium ? (
                  <Ionicons name="sparkles" size={14} color={accentColor} />
                ) : null}
                <Text
                  className="text-sm font-semibold"
                  style={{ color: isPremium ? accentColor : mutedColor }}
                >
                  {isPremium ? "Premium" : "Free"}
                </Text>
              </View>
            </View>

            {!isPremium && (
              <View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm text-muted">Free messages today</Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {freeTrials} / {MAX_FREE_TRIALS}
                  </Text>
                </View>
                <View className="h-2 w-full rounded-full bg-default overflow-hidden">
                  <View
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${trialPercent}%` }}
                  />
                </View>
              </View>
            )}

            <Pressable
              onPress={() => WebBrowser.openBrowserAsync(WEB_PROFILE_URL)}
              className="flex-row items-center justify-between py-3.5 px-3.5 rounded-2xl border border-separator bg-surface active:opacity-85 mt-1"
            >
              <View className="flex-row items-center gap-2.5 flex-1 min-w-0">
                <View className="size-9 rounded-xl bg-accent/12 items-center justify-center">
                  <Ionicons name="card-outline" size={18} color={accentColor} />
                </View>
                <Text className="text-sm font-semibold text-foreground flex-1">
                  {isPremium ? "Manage subscription" : "Upgrade to Premium"}
                </Text>
              </View>
              <Ionicons name="open-outline" size={16} color={mutedColor} />
            </Pressable>
          </Card.Body>
        </Card>

        <Card className="mb-4 rounded-3xl border border-separator overflow-hidden">
          <Card.Body className="gap-4 py-5">
            <Text className={SECTION_LABEL}>Security</Text>
            {pwSuccess && (
              <View className="rounded-xl border border-success/30 bg-success/10 px-3 py-2.5">
                <Text className="text-xs font-semibold text-success">
                  Password changed successfully
                </Text>
              </View>
            )}
            {pwError ? (
              <View className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2.5">
                <Text className="text-xs font-medium text-danger">{pwError}</Text>
              </View>
            ) : null}
            <TextField>
              <Label>Current password</Label>
              <Input
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                placeholder="••••••••"
              />
            </TextField>
            <TextField>
              <Label>New password</Label>
              <Input
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                placeholder="Min. 8 characters"
              />
            </TextField>
            <TextField isInvalid={!!pwError}>
              <Label>Confirm new password</Label>
              <Input
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholder="••••••••"
              />
            </TextField>
            <Button
              onPress={handleChangePassword}
              isDisabled={
                pwLoading ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
            >
              {pwLoading ? "Saving…" : "Change password"}
            </Button>
          </Card.Body>
        </Card>

        <Card className="mb-4 rounded-3xl border border-separator overflow-hidden">
          <Card.Body className="gap-4 py-5">
            <View className="flex-row items-center justify-between gap-2">
              <View className="flex-row items-center gap-2 flex-1 min-w-0">
                <Ionicons name="flag-outline" size={18} color={accentColor} />
                <Text className="text-sm font-semibold text-foreground">
                  Feedback & issues
                </Text>
              </View>
              <View className="flex-row items-center gap-2 shrink-0">
                <Pressable
                  onPress={() => setShowReportSheet(true)}
                  className="flex-row items-center gap-1 px-3 py-2 rounded-xl border border-accent/35 bg-accent/10 active:opacity-80"
                >
                  <Ionicons name="add" size={16} color={accentColor} />
                  <Text className="text-xs font-semibold text-accent">New</Text>
                </Pressable>
                <Pressable
                  onPress={() => setShowMyIssues((v) => !v)}
                  className="p-2 rounded-full bg-default active:opacity-70"
                  accessibilityLabel={
                    showMyIssues ? "Hide issue list" : "Show issue list"
                  }
                >
                  <Ionicons
                    name={showMyIssues ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={mutedColor}
                  />
                </Pressable>
              </View>
            </View>
            {showMyIssues && <MyIssuesList />}
          </Card.Body>
        </Card>

        <Card className="mb-4 rounded-3xl border border-separator overflow-hidden">
          <Card.Body className="py-2">
            <Button variant="outline" onPress={handleSignOut} className="mx-1">
              <Ionicons name="log-out-outline" size={18} color={mutedColor} />
              <Button.Label>Sign out</Button.Label>
            </Button>
          </Card.Body>
        </Card>

        <Card className="mb-4 rounded-3xl border border-separator overflow-hidden">
          <Card.Body className="gap-2 py-4">
            <Text className={`${SECTION_LABEL} px-1 mb-1`}>Legal</Text>
            {legalLinks.map(({ label, url }) => (
              <Pressable
                key={label}
                onPress={() => WebBrowser.openBrowserAsync(url)}
                className="flex-row items-center justify-between py-3.5 px-3 rounded-2xl border border-transparent active:bg-default active:border-separator"
              >
                <Text className="text-sm font-medium text-foreground">
                  {label}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={mutedColor} />
              </Pressable>
            ))}
          </Card.Body>
        </Card>

        <Card
          className="mb-2 rounded-3xl border-2 border-danger/35 bg-danger/5 overflow-hidden"
        >
          <Card.Body className="gap-4 py-5">
            <View>
              <Text className="text-base font-semibold text-foreground">
                Delete account
              </Text>
              <Text className="text-sm text-muted mt-1 leading-relaxed">
                Permanently remove your account and all associated data.
              </Text>
            </View>
            <Button variant="danger" onPress={handleDeleteAccount}>
              <Ionicons name="trash-outline" size={17} color="white" />
              <Button.Label>Delete my account</Button.Label>
            </Button>
          </Card.Body>
        </Card>
      </ScrollView>

      <ReportIssueSheet
        isOpen={showReportSheet}
        onOpenChange={setShowReportSheet}
      />
    </SafeAreaView>
  );
}
