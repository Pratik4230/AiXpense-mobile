import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { BottomSheet, Button, TextField, Input, Label, useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { useReportIssue } from "@/hooks/queries/useIssues";

type IssueType = "bug" | "feature" | "other";

const TYPES: { value: IssueType; label: string; icon: string }[] = [
  { value: "bug", label: "Bug", icon: "bug-outline" },
  { value: "feature", label: "Feature", icon: "bulb-outline" },
  { value: "other", label: "Other", icon: "help-circle-outline" },
];

interface Props {
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
}

export function ReportIssueSheet({ isOpen, onOpenChange }: Props) {
  const [type, setType] = useState<IssueType>("bug");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [titleError, setTitleError] = useState("");
  const [descError, setDescError] = useState("");

  const { mutate, isPending } = useReportIssue();
  const [mutedColor, accentColor] = useThemeColor(["muted", "accent"]);

  const reset = () => {
    setType("bug");
    setTitle("");
    setDescription("");
    setTitleError("");
    setDescError("");
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const handleSubmit = () => {
    let valid = true;
    if (!title.trim()) {
      setTitleError("Title is required");
      valid = false;
    } else {
      setTitleError("");
    }
    if (!description.trim()) {
      setDescError("Description is required");
      valid = false;
    } else {
      setDescError("");
    }
    if (!valid) return;

    mutate(
      { type, title: title.trim(), description: description.trim() },
      { onSuccess: handleClose },
    );
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content
          snapPoints={["75%"]}
        >
          <KeyboardAwareScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, paddingTop: 8 }}
            keyboardShouldPersistTaps="handled"
            bottomOffset={32}
          >
            <BottomSheet.Title className="text-lg font-bold text-foreground mb-5">
              Report an Issue
            </BottomSheet.Title>

            <View className="gap-3 mb-4">
              <Text className="text-xs font-semibold text-muted uppercase tracking-widest">
                Type
              </Text>
              <View className="flex-row gap-2">
                {TYPES.map((t) => (
                  <Pressable
                    key={t.value}
                    onPress={() => setType(t.value)}
                    className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl border"
                    style={{
                      borderColor: type === t.value ? accentColor : "#3334",
                      backgroundColor:
                        type === t.value ? accentColor + "18" : "transparent",
                    }}
                  >
                    <Ionicons
                      name={t.icon as any}
                      size={14}
                      color={type === t.value ? accentColor : mutedColor}
                    />
                    <Text
                      className="text-xs font-medium"
                      style={{ color: type === t.value ? accentColor : mutedColor }}
                    >
                      {t.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="gap-4 mb-6">
              <TextField isInvalid={!!titleError}>
                <Label>Title</Label>
                <Input
                  value={title}
                  onChangeText={(v) => {
                    setTitle(v);
                    if (titleError) setTitleError("");
                  }}
                  placeholder="Brief summary of the issue"
                  returnKeyType="next"
                />
                {!!titleError && (
                  <Text className="text-xs text-danger mt-1">{titleError}</Text>
                )}
              </TextField>

              <TextField isInvalid={!!descError}>
                <Label>Description</Label>
                <Input
                  value={description}
                  onChangeText={(v) => {
                    setDescription(v);
                    if (descError) setDescError("");
                  }}
                  placeholder="What happened? What did you expect?"
                  multiline
                  numberOfLines={4}
                  style={{ minHeight: 90, textAlignVertical: "top" }}
                  returnKeyType="done"
                  blurOnSubmit
                />
                {!!descError && (
                  <Text className="text-xs text-danger mt-1">{descError}</Text>
                )}
              </TextField>
            </View>

            <View className="flex-row gap-3">
              <Button variant="outline" onPress={handleClose} className="flex-1">
                <Button.Label>Cancel</Button.Label>
              </Button>
              <Button
                onPress={handleSubmit}
                isDisabled={isPending}
                className="flex-1"
              >
                <Button.Label>
                  {isPending ? "Submitting..." : "Submit"}
                </Button.Label>
              </Button>
            </View>
          </KeyboardAwareScrollView>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
