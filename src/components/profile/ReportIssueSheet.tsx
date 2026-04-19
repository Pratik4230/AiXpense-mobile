import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import {
  BottomSheet,
  Button,
  TextField,
  Input,
  Label,
  useThemeColor,
} from "heroui-native";
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
        <BottomSheet.Content snapPoints={["75%"]}>
          <KeyboardAwareScrollView
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: 36,
              paddingTop: 4,
            }}
            keyboardShouldPersistTaps="handled"
            bottomOffset={32}
          >
            <BottomSheet.Title className="text-lg font-bold text-foreground">
              Report an issue
            </BottomSheet.Title>
            <Text className="text-sm text-muted leading-snug mt-1 mb-5">
              We read every report. Include steps to reproduce for bugs.
            </Text>

            <View className="gap-3 mb-5">
              <Text className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                Type
              </Text>
              <View className="flex-row gap-2">
                {TYPES.map((t) => {
                  const selected = type === t.value;
                  return (
                    <Pressable
                      key={t.value}
                      onPress={() => setType(t.value)}
                      className={`flex-1 flex-row items-center justify-center gap-1.5 py-3 rounded-2xl border-[1.5px] ${
                        selected
                          ? "border-accent bg-accent/12"
                          : "border-separator bg-transparent"
                      }`}
                    >
                      <Ionicons
                        name={t.icon as any}
                        size={15}
                        color={selected ? accentColor : mutedColor}
                      />
                      <Text
                        className={`text-xs font-semibold ${
                          selected ? "text-accent" : "text-muted"
                        }`}
                      >
                        {t.label}
                      </Text>
                    </Pressable>
                  );
                })}
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
                  placeholder="Short summary"
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
                  style={{
                    minHeight: 96,
                    textAlignVertical: "top",
                  }}
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
                  {isPending ? "Submitting…" : "Submit"}
                </Button.Label>
              </Button>
            </View>
          </KeyboardAwareScrollView>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}
