import { useCallback, useState } from "react";
import { Alert, Linking } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadReceiptToImageKit } from "@/lib/imagekitUpload";
import { webApiBase } from "@/lib/env";

const MAX_BYTES = 10 * 1024 * 1024;

function premiumUrl() {
  return `${webApiBase()}/premium`;
}

type UploadedFile = { url: string; mediaType: string };

type Options = {
  isPremium: boolean;
  disabled?: boolean;
  onUploaded: (file: UploadedFile) => void;
  /** Called when capture is aborted (non-premium, cancel, failed pick). */
  onCaptureDismissed?: () => void;
};

export function useReceiptCapture({
  isPremium,
  disabled = false,
  onUploaded,
  onCaptureDismissed,
}: Options) {
  const [uploading, setUploading] = useState(false);

  const dismiss = useCallback(() => {
    onCaptureDismissed?.();
  }, [onCaptureDismissed]);

  const runPickAndUpload = useCallback(
    async (source: "camera" | "library") => {
      if (disabled || uploading) return;

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
          dismiss();
          return;
        }
        result = await ImagePicker.launchCameraAsync(opts);
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          Alert.alert(
            "Photos",
            "Photo library access is required to attach a receipt.",
          );
          dismiss();
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync(opts);
      }

      if (result.canceled || !result.assets?.[0]) {
        dismiss();
        return;
      }

      const asset = result.assets[0];
      if (asset.fileSize != null && asset.fileSize > MAX_BYTES) {
        Alert.alert("File too large", "Receipt images must be 10 MB or smaller.");
        dismiss();
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
        onUploaded(uploaded);
      } catch (e) {
        dismiss();
        const msg = e instanceof Error ? e.message : "Upload failed";
        Alert.alert(
          "Upload failed",
          msg.includes("401") ? "Please sign in again." : msg,
        );
      } finally {
        setUploading(false);
      }
    },
    [disabled, uploading, onUploaded, dismiss],
  );

  const startReceiptCapture = useCallback(() => {
    if (disabled || uploading) return;

    if (!isPremium) {
      Alert.alert(
        "Premium feature",
        "Bill scanning with a photo is available on Premium. Upgrade to unlock receipt capture.",
        [
          { text: "Not now", style: "cancel", onPress: dismiss },
          {
            text: "View plans",
            onPress: () => {
              dismiss();
              void Linking.openURL(premiumUrl());
            },
          },
        ],
      );
      return;
    }

    Alert.alert("Receipt", "Add a photo of your bill", [
      { text: "Cancel", style: "cancel", onPress: dismiss },
      { text: "Take photo", onPress: () => void runPickAndUpload("camera") },
      { text: "Photo library", onPress: () => void runPickAndUpload("library") },
    ]);
  }, [disabled, uploading, isPremium, runPickAndUpload, dismiss]);

  return { startReceiptCapture, uploading };
}
