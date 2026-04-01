import { useState } from "react";
import { View, Text, Alert, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
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

export default function ProfileScreen() {
  const { data: session, isPending: sessionLoading } = useSession();
  const user = session?.user as any;

  const [accentColor, dangerColor, mutedColor, successColor] = useThemeColor([
    "accent",
    "danger",
    "muted",
    "success",
  ]);

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
          router.replace("/(auth)/login");
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
              router.replace("/(auth)/login");
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
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-sm text-muted">Loading...</Text>
      </SafeAreaView>
    );
  }

  const isPremium = user.isPremium ?? false;
  const freeTrials = user.freeTrials ?? 0;
  const trialPercent = Math.min((freeTrials / MAX_FREE_TRIALS) * 100, 100);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="px-4 pb-12"
        showsVerticalScrollIndicator={false}
      >
        <View className="py-4">
          <Text className="text-2xl font-bold text-foreground">Profile</Text>
          <Text className="text-sm text-muted">Account & settings</Text>
        </View>

        <Card className="mb-4">
          <Card.Body className="gap-5 py-5">
            <View className="flex-row items-center gap-4">
              <Avatar size="lg" color="accent" variant="soft" alt={user.name}>
                <Avatar.Fallback>{getInitials(user.name)}</Avatar.Fallback>
              </Avatar>

              <View className="flex-1">
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
                        {nameSaving ? "Saving..." : "Save"}
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
                    <Text className="text-lg font-semibold text-foreground flex-1">
                      {user.name}
                    </Text>
                    <Pressable
                      onPress={() => {
                        setNameValue(user.name);
                        setEditingName(true);
                      }}
                    >
                      <Ionicons
                        name="pencil-outline"
                        size={16}
                        color={mutedColor}
                      />
                    </Pressable>
                  </View>
                )}
                <Text className="text-sm text-muted mt-0.5">{user.email}</Text>
              </View>
            </View>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Body className="gap-3">
            <Text className="text-xs font-semibold text-muted uppercase tracking-widest">
              Plan & Usage
            </Text>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-muted">Current plan</Text>
              <Text
                className="text-sm font-semibold"
                style={{ color: isPremium ? accentColor : mutedColor }}
              >
                {isPremium ? "Premium" : "Free"}
              </Text>
            </View>

            {!isPremium && (
              <>
                <View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-sm text-muted">
                      Free messages today
                    </Text>
                    <Text className="text-sm font-medium text-foreground">
                      {freeTrials} / {MAX_FREE_TRIALS}
                    </Text>
                  </View>
                  <View className="h-1.5 w-full rounded-full bg-default overflow-hidden">
                    <View
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${trialPercent}%` }}
                    />
                  </View>
                </View>
              </>
            )}

            <Pressable
              onPress={() => WebBrowser.openBrowserAsync(WEB_PROFILE_URL)}
              className="flex-row items-center justify-between py-2.5 px-3 rounded-xl border border-separator mt-1"
            >
              <View className="flex-row items-center gap-2">
                <Ionicons name="card-outline" size={16} color={accentColor} />
                <Text className="text-sm font-medium text-foreground">
                  {isPremium ? "Manage Subscription" : "Upgrade to Premium"}
                </Text>
              </View>
              <Ionicons
                name="open-outline"
                size={14}
                color={mutedColor}
              />
            </Pressable>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Body className="gap-4">
            <Text className="text-xs font-semibold text-muted uppercase tracking-widest">
              Change Password
            </Text>
            {pwSuccess && (
              <View
                className="rounded-xl px-3 py-2"
                style={{ backgroundColor: successColor + "22" }}
              >
                <Text
                  className="text-xs font-medium"
                  style={{ color: successColor }}
                >
                  Password changed successfully
                </Text>
              </View>
            )}
            {pwError ? (
              <View
                className="rounded-xl px-3 py-2"
                style={{ backgroundColor: dangerColor + "22" }}
              >
                <Text className="text-xs" style={{ color: dangerColor }}>
                  {pwError}
                </Text>
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
              {pwLoading ? "Saving..." : "Change password"}
            </Button>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Body className="gap-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Ionicons name="bug-outline" size={16} color={mutedColor} />
                <Text className="text-xs font-semibold text-muted uppercase tracking-widest">
                  My Reports
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Pressable
                  onPress={() => setShowReportSheet(true)}
                  className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-lg border border-separator"
                >
                  <Ionicons name="flag-outline" size={13} color={accentColor} />
                  <Text
                    className="text-xs font-medium"
                    style={{ color: accentColor }}
                  >
                    New Report
                  </Text>
                </Pressable>
                <Pressable onPress={() => setShowMyIssues((v) => !v)}>
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

        <Card className="mb-4">
          <Card.Body>
            <Button variant="outline" onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={16} color={mutedColor} />
              <Button.Label>Sign out</Button.Label>
            </Button>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Body className="gap-1">
            <Text className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">
              Legal
            </Text>
            {(
              [
                {
                  label: "Privacy Policy",
                  url: "https://aixpense.in/privacy",
                },
                {
                  label: "Terms & Conditions",
                  url: "https://aixpense.in/terms",
                },
                { label: "Refund Policy", url: "https://aixpense.in/refund" },
                { label: "Contact Us", url: "https://aixpense.in/contact" },
              ] as const
            ).map(({ label, url }) => (
              <Pressable
                key={label}
                onPress={() => WebBrowser.openBrowserAsync(url)}
                className="flex-row items-center justify-between py-3 border-b border-separator last:border-b-0"
              >
                <Text className="text-sm text-foreground">{label}</Text>
                <Ionicons name="chevron-forward" size={16} color={mutedColor} />
              </Pressable>
            ))}
          </Card.Body>
        </Card>

        <Card
          className="mb-4"
          style={{ borderColor: dangerColor + "33", borderWidth: 1 }}
        >
          <Card.Body className="gap-3">
            <View>
              <Text className="text-sm font-semibold text-foreground">
                Delete account
              </Text>
              <Text className="text-xs text-muted mt-0.5">
                Permanently remove your account and all data
              </Text>
            </View>
            <Button variant="danger" onPress={handleDeleteAccount}>
              <Ionicons name="trash-outline" size={15} color="white" />
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
