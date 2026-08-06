import { useEffect, useRef } from "react";
import { Alert } from "react-native";
import { useShareIntentContext } from "expo-share-intent";
import { uploadReceiptToImageKit } from "@/lib/imagekitUpload";
import type { LocalReceiptFile } from "@/hooks/useReceiptCapture";

const MAX_BYTES = 10 * 1024 * 1024;

type UploadedFile = { url: string; mediaType: string };

type Options = {
  /** False until chat session is ready to accept a receipt. */
  enabled: boolean;
  isOnline?: boolean;
  /** True while streaming / trials loading / another upload in flight. */
  disabled?: boolean;
  onUploaded: (file: UploadedFile) => void;
  onQueued?: (file: LocalReceiptFile) => void;
};

/**
 * Android/iOS share → first image → ImageKit (or offline queue) → chat scanBill.
 * Requires a native rebuild after adding the expo-share-intent plugin.
 */
export function useShareIntentReceipt({
  enabled,
  isOnline = true,
  disabled = false,
  onUploaded,
  onQueued,
}: Options) {
  const { hasShareIntent, shareIntent, resetShareIntent, isReady } =
    useShareIntentContext();
  const processingRef = useRef(false);

  useEffect(() => {
    if (!isReady || !hasShareIntent || !enabled || disabled) return;
    if (processingRef.current) return;

    const files = shareIntent.files ?? [];
    const image = files.find((f) => f.mimeType?.startsWith("image/"));
    if (!image?.path) {
      // Text / non-image shares: clear so we don't loop
      if (hasShareIntent) resetShareIntent();
      return;
    }

    if (image.size != null && image.size > MAX_BYTES) {
      resetShareIntent();
      Alert.alert("File too large", "Receipt images must be 10 MB or smaller.");
      return;
    }

    const mime = image.mimeType || "image/jpeg";
    const ext = mime.includes("png") ? "png" : "jpg";
    const fileName = image.fileName || `receipt-${Date.now()}.${ext}`;
    const uri = image.path.startsWith("file:")
      ? image.path
      : image.path.startsWith("content:")
        ? image.path
        : `file://${image.path}`;

    processingRef.current = true;

    const run = async () => {
      try {
        if (!isOnline) {
          if (!onQueued) {
            Alert.alert(
              "You're offline",
              "Connect to the internet to upload this receipt, or update the app.",
            );
            return;
          }
          onQueued({ uri, fileName, mimeType: mime });
          return;
        }

        const uploaded = await uploadReceiptToImageKit({
          uri,
          fileName,
          mimeType: mime,
        });
        onUploaded(uploaded);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Upload failed";
        Alert.alert(
          "Upload failed",
          msg.includes("401") ? "Please sign in again." : msg,
        );
      } finally {
        resetShareIntent();
        processingRef.current = false;
      }
    };

    void run();
  }, [
    isReady,
    hasShareIntent,
    shareIntent,
    enabled,
    disabled,
    isOnline,
    onUploaded,
    onQueued,
    resetShareIntent,
  ]);
}
