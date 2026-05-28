import { useState, useEffect } from "react";
import {
  Platform,
  View,
  useColorScheme,
  Alert,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  setAudioModeAsync,
  requestRecordingPermissionsAsync,
} from "expo-audio";
import { Button, Input } from "heroui-native";
import type { SelectedTransaction } from "./TransactionAttachment";
import { transcribeVoiceRecording } from "@/lib/voiceTranscription";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  isLoading: boolean;
  selectedTransaction?: SelectedTransaction | null;
  isPremium: boolean;
  onVoiceTranscript: (text: string) => void;
  startReceiptCapture: () => void;
  receiptUploading: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  isLoading,
  selectedTransaction,
  isPremium,
  onVoiceTranscript,
  startReceiptCapture,
  receiptUploading,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const hasText = value.trim().length > 0;
  const isDelete = selectedTransaction?.action === "delete";
  const canSend = isDelete || hasText;
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const isRecording = recorderState.isRecording;

  const voiceBusy = isRecording || voiceProcessing;
  const busy = isLoading || receiptUploading || voiceProcessing || isRecording;

  const placeholder = receiptUploading
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

  const onAttachPress = () => {
    if (busy || isDelete || selectedTransaction || voiceBusy) return;
    startReceiptCapture();
  };

  const startVoiceRecording = async () => {
    if (busy || isDelete || selectedTransaction || receiptUploading) return;

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
    if (receiptUploading) return;
    if (isRecording) {
      void stopVoiceRecording();
      return;
    }
    if (busy || isDelete || selectedTransaction) return;
    void startVoiceRecording();
  };

  const micDisabled =
    receiptUploading ||
    isDelete ||
    !!selectedTransaction ||
    isLoading ||
    voiceProcessing;

  const iconMuted = isDark ? "#e4e4e7" : "#52525b";

  return (
    <View className="border-t border-separator bg-background">
      <View
        style={{
          paddingHorizontal: 10,
          paddingTop: 10,
          paddingBottom: 10,
          flexDirection: "row",
          alignItems: "flex-end",
          gap: 8,
        }}
      >
      <View
        pointerEvents={isInputFocused ? "none" : "auto"}
        style={{
          width: isInputFocused ? 0 : 40,
          opacity: isInputFocused ? 0 : 1,
          overflow: "hidden",
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
          {receiptUploading ? (
            <ActivityIndicator size="small" color="#f97316" />
          ) : (
            <Ionicons
              name={isPremium ? "camera-outline" : "lock-closed-outline"}
              size={20}
              color={isPremium ? iconMuted : "#a16207"}
            />
          )}
        </Pressable>
      </View>

      <Input
        value={value}
        onChangeText={onChange}
        onFocus={() => setIsInputFocused(true)}
        onBlur={() => setIsInputFocused(false)}
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

      <View
        pointerEvents={isInputFocused ? "none" : "auto"}
        style={{
          width: isInputFocused ? 0 : 40,
          opacity: isInputFocused ? 0 : 1,
          overflow: "hidden",
        }}
      >
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
      </View>

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
    </View>
  );
}
