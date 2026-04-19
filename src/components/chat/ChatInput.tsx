import { useState, useEffect } from "react";
import {
  Platform,
  View,
  useColorScheme,
  Alert,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  setAudioModeAsync,
  requestRecordingPermissionsAsync,
} from "expo-audio";
import { Button, Input } from "heroui-native";
import type { SelectedTransaction } from "./TransactionAttachment";
import { uploadReceiptToImageKit } from "@/lib/imagekitUpload";
import { transcribeVoiceRecording } from "@/lib/voiceTranscription";

const MAX_BYTES = 10 * 1024 * 1024;

function premiumUrl() {
  const base = (process.env.EXPO_PUBLIC_WEB_API_URL ?? "https://aixpense.in").replace(
    /\/$/,
    "",
  );
  return `${base}/premium`;
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  isLoading: boolean;
  selectedTransaction?: SelectedTransaction | null;
  isPremium: boolean;
  onReceiptUploaded: (file: { url: string; mediaType: string }) => void;
  onVoiceTranscript: (text: string) => void;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  isLoading,
  selectedTransaction,
  isPremium,
  onReceiptUploaded,
  onVoiceTranscript,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const { bottom } = useSafeAreaInsets();
  const hasText = value.trim().length > 0;
  const isDelete = selectedTransaction?.action === "delete";
  const canSend = isDelete || hasText;
  const [uploading, setUploading] = useState(false);
  const [voiceProcessing, setVoiceProcessing] = useState(false);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const isRecording = recorderState.isRecording;

  const voiceBusy = isRecording || voiceProcessing;
  const busy = isLoading || uploading || voiceProcessing || isRecording;

  const placeholder = uploading
    ? "Uploading bill..."
    : isRecording
      ? "Listening..."
      : voiceProcessing
        ? "Transcribing..."
        : selectedTransaction
          ? selectedTransaction.action === "delete"
            ? "Tap send to confirm delete..."
            : "Type what to change..."
          : "Message...";

  useEffect(() => {
    return () => {
      try {
        if (audioRecorder.getStatus().isRecording) {
          void audioRecorder.stop();
        }
      } catch {
        /* noop */
      }
    };
  }, [audioRecorder]);

  const runPickAndUpload = async (source: "camera" | "library") => {
    if (busy || isDelete || selectedTransaction || voiceBusy) return;

    const opts: ImagePicker.ImagePickerOptions = {
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.85,
    };

    let result: ImagePicker.ImagePickerResult;
    if (source === "camera") {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Camera", "Camera access is required to scan a receipt.");
        return;
      }
      result = await ImagePicker.launchCameraAsync(opts);
    } else {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Photos", "Photo library access is required to attach a receipt.");
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync(opts);
    }

    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    if (asset.fileSize != null && asset.fileSize > MAX_BYTES) {
      Alert.alert("File too large", "Receipt images must be 10 MB or smaller.");
      return;
    }

    const mime = asset.mimeType ?? "image/jpeg";
    const ext = mime.includes("png") ? "png" : "jpg";
    const fileName = asset.fileName ?? `receipt-${Date.now()}.${ext}`;

    setUploading(true);
    try {
      const uploaded = await uploadReceiptToImageKit({
        uri: asset.uri,
        fileName,
        mimeType: mime,
      });
      onReceiptUploaded(uploaded);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      Alert.alert("Upload failed", msg.includes("401") ? "Please sign in again." : msg);
    } finally {
      setUploading(false);
    }
  };

  const onAttachPress = () => {
    if (busy || isDelete || selectedTransaction || voiceBusy) return;

    if (!isPremium) {
      Alert.alert(
        "Premium feature",
        "Bill scanning with a photo is available on Premium. Upgrade to unlock receipt capture.",
        [
          { text: "Not now", style: "cancel" },
          { text: "View plans", onPress: () => void Linking.openURL(premiumUrl()) },
        ],
      );
      return;
    }

    Alert.alert("Receipt", "Add a photo of your bill", [
      { text: "Cancel", style: "cancel" },
      { text: "Take photo", onPress: () => void runPickAndUpload("camera") },
      { text: "Photo library", onPress: () => void runPickAndUpload("library") },
    ]);
  };

  const startVoiceRecording = async () => {
    if (busy || isDelete || selectedTransaction || uploading) return;

    const perm = await requestRecordingPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Microphone", "Microphone access is needed for voice input.");
      return;
    }

    try {
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not start recording";
      Alert.alert("Voice input", msg);
    }
  };

  const stopVoiceRecording = async () => {
    if (!isRecording) return;

    try {
      await audioRecorder.stop();
    } catch {
      /* noop */
    }

    const uri = audioRecorder.uri ?? audioRecorder.getStatus().url;
    if (!uri) {
      Alert.alert("Voice input", "No audio was captured.");
      return;
    }

    setVoiceProcessing(true);
    try {
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });
      const transcript = await transcribeVoiceRecording({
        uri,
        fileName: "audio.m4a",
        mimeType: "audio/mp4",
      });
      onVoiceTranscript(transcript);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Transcription failed";
      Alert.alert("Voice input", msg);
    } finally {
      setVoiceProcessing(false);
    }
  };

  const onMicPress = () => {
    if (uploading) return;
    if (isRecording) {
      void stopVoiceRecording();
      return;
    }
    if (busy || isDelete || selectedTransaction) return;
    void startVoiceRecording();
  };

  const micDisabled =
    uploading ||
    isDelete ||
    !!selectedTransaction ||
    isLoading ||
    voiceProcessing;

  const iconMuted = isDark ? "#e4e4e7" : "#52525b";

  return (
    <View
      className="border-t border-separator bg-background"
      style={{
        paddingHorizontal: 10,
        paddingTop: 10,
        paddingBottom: Math.max(bottom, 10),
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 8,
      }}
    >
      <Pressable
        onPress={onAttachPress}
        disabled={busy || !!isDelete || !!selectedTransaction || voiceBusy}
        style={({ pressed }) => ({
          width: 40,
          height: 40,
          borderRadius: 999,
          marginBottom: 2,
          alignItems: "center",
          justifyContent: "center",
          opacity:
            busy || isDelete || selectedTransaction || voiceBusy
              ? 0.35
              : pressed
                ? 0.75
                : 1,
          backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        })}
        hitSlop={8}
      >
        {uploading ? (
          <ActivityIndicator size="small" color="#f97316" />
        ) : (
          <Ionicons
            name={isPremium ? "camera-outline" : "lock-closed-outline"}
            size={20}
            color={isPremium ? iconMuted : "#a16207"}
          />
        )}
      </Pressable>

      <Input
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        multiline
        maxLength={500}
        submitBehavior="newline"
        isDisabled={busy || !!isDelete || isRecording}
        className="flex-1 rounded-[22px] px-4"
        style={{
          maxHeight: 120,
          paddingVertical: Platform.OS === "android" ? 10 : 10,
          fontSize: 16,
          lineHeight: 22,
          includeFontPadding: false,
          textAlignVertical: "center",
        }}
      />

      <Pressable
        onPress={onMicPress}
        disabled={micDisabled && !isRecording}
        style={({ pressed }) => ({
          width: 40,
          height: 40,
          borderRadius: 999,
          marginBottom: 2,
          alignItems: "center",
          justifyContent: "center",
          opacity: micDisabled && !isRecording ? 0.35 : pressed ? 0.75 : 1,
          backgroundColor: isRecording
            ? "rgba(239,68,68,0.22)"
            : isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.06)",
        })}
        hitSlop={8}
      >
        {voiceProcessing ? (
          <ActivityIndicator size="small" color="#f97316" />
        ) : (
          <Ionicons
            name={isRecording ? "stop" : "mic-outline"}
            size={20}
            color={isRecording ? "#ef4444" : iconMuted}
          />
        )}
      </Pressable>

      <Button
        isIconOnly
        size="sm"
        onPress={onSend}
        isDisabled={busy || !canSend}
        className={`rounded-full w-10 h-10 self-end mb-0.5 ${isDelete ? "bg-danger" : ""}`}
      >
        <Ionicons
          name={isDelete ? "trash" : "send"}
          size={18}
          color="#fff"
          style={canSend && !isDelete ? { marginLeft: 2 } : undefined}
        />
      </Button>
    </View>
  );
}
