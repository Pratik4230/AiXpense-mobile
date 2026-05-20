import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "heroui-native";
import { uploadFileToImageKit } from "@/lib/imagekitUpload";

const MAX_FILES = 5;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

export type IssueAttachment = {
  url: string;
  fileId: string;
  type: "image" | "video";
  name: string;
};

interface Props {
  value: IssueAttachment[];
  onChange: (attachments: IssueAttachment[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
  maxFiles?: number;
}

function isVideoMime(mime: string) {
  return mime.startsWith("video/");
}

function fileNameFromAsset(
  asset: ImagePicker.ImagePickerAsset,
  mime: string,
): string {
  if (asset.fileName) return asset.fileName;
  const ext = mime.includes("png")
    ? "png"
    : mime.includes("webp")
      ? "webp"
      : mime.includes("mp4")
        ? "mp4"
        : mime.includes("quicktime")
          ? "mov"
          : "jpg";
  return `issue-${Date.now()}.${ext}`;
}

export function IssueMediaAttachments({
  value,
  onChange,
  onUploadingChange,
  maxFiles = MAX_FILES,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [mutedColor, accentColor, dangerColor] = useThemeColor([
    "muted",
    "accent",
    "danger",
  ]);

  const remaining = maxFiles - value.length;
  const isFull = remaining <= 0;

  const uploadAssets = async (assets: ImagePicker.ImagePickerAsset[]) => {
    if (!assets.length || isFull) return;

    const toUpload = assets.slice(0, remaining);
    const oversized = toUpload.filter((a) => {
      const mime = a.mimeType ?? "image/jpeg";
      const max = isVideoMime(mime) ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
      return a.fileSize != null && a.fileSize > max;
    });

    if (oversized.length > 0) {
      Alert.alert(
        "File too large",
        "Images must be 10 MB or smaller. Videos must be 50 MB or smaller.",
      );
      return;
    }

    setUploading(true);
    onUploadingChange?.(true);
    const uploaded: IssueAttachment[] = [];

    try {
      for (const asset of toUpload) {
        const mime = asset.mimeType ?? "image/jpeg";
        const fileName = fileNameFromAsset(asset, mime);
        const result = await uploadFileToImageKit({
          uri: asset.uri,
          fileName,
          mimeType: mime,
          folder: "/issues",
        });
        uploaded.push({
          url: result.url,
          fileId: result.fileId,
          type: isVideoMime(mime) ? "video" : "image",
          name: fileName,
        });
      }
      onChange([...value, ...uploaded]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      Alert.alert(
        "Upload failed",
        msg.includes("401") ? "Please sign in again." : msg,
      );
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  };

  const pickFromLibrary = async () => {
    if (isFull || uploading) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Photos", "Photo library access is required to attach files.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.85,
    });
    if (result.canceled || !result.assets?.length) return;
    await uploadAssets(result.assets);
  };

  const pickFromCamera = async () => {
    if (isFull || uploading) return;
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Camera", "Camera access is required to take a photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.85,
    });
    if (result.canceled || !result.assets?.[0]) return;
    await uploadAssets([result.assets[0]]);
  };

  const onAddPress = () => {
    if (isFull || uploading) return;
    Alert.alert("Add attachment", "Screenshots or screen recordings help us fix bugs faster.", [
      { text: "Take photo", onPress: () => void pickFromCamera() },
      { text: "Choose from library", onPress: () => void pickFromLibrary() },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const remove = (url: string) => {
    onChange(value.filter((m) => m.url !== url));
  };

  return (
    <View className="gap-3">
      <View>
        <Text className="text-sm font-medium text-foreground">Attachments</Text>
        <Text className="text-xs text-muted mt-0.5">
          Optional — up to {maxFiles} images or videos (10 MB / 50 MB each)
        </Text>
      </View>

      {value.length > 0 && (
        <View className="flex-row flex-wrap gap-2">
          {value.map((m) => (
            <View
              key={m.url}
              className="relative w-[30%] aspect-square rounded-xl overflow-hidden border border-separator bg-default"
            >
              {m.type === "image" ? (
                <Image
                  source={{ uri: m.url }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              ) : (
                <View className="flex-1 items-center justify-center gap-1 px-1">
                  <Ionicons name="videocam-outline" size={28} color={mutedColor} />
                  <Text
                    className="text-[10px] text-muted text-center"
                    numberOfLines={2}
                  >
                    {m.name}
                  </Text>
                </View>
              )}
              <Pressable
                onPress={() => remove(m.url)}
                className="absolute top-1 right-1 size-6 rounded-full bg-background/90 items-center justify-center border border-separator active:opacity-80"
                accessibilityLabel="Remove attachment"
              >
                <Ionicons name="close" size={14} color={dangerColor} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {uploading && (
        <View className="flex-row items-center gap-2 py-2">
          <ActivityIndicator size="small" color={accentColor} />
          <Text className="text-xs text-muted">Uploading…</Text>
        </View>
      )}

      {!isFull && (
        <Pressable
          onPress={onAddPress}
          disabled={uploading}
          className={`flex-row items-center justify-center gap-2 py-3.5 rounded-2xl border border-dashed border-separator bg-surface active:opacity-85 ${
            uploading ? "opacity-50" : ""
          }`}
        >
          <Ionicons name="images-outline" size={20} color={accentColor} />
          <Text className="text-sm font-semibold text-accent">
            {value.length === 0 ? "Add photos or videos" : `Add more (${remaining} left)`}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
