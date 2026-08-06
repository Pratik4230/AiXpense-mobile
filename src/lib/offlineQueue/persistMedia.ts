import { Directory, File, Paths } from "expo-file-system";

const QUEUE_DIR_NAME = "offline-queue";

function queueDir(): Directory {
  const dir = new Directory(Paths.document, QUEUE_DIR_NAME);
  if (!dir.exists) {
    dir.create({ intermediates: true, idempotent: true });
  }
  return dir;
}

/**
 * Copy a transient picker/recorder URI into app documents so it survives
 * cache cleanup until the offline job flushes.
 */
export async function persistOfflineMedia(params: {
  sourceUri: string;
  fileName: string;
}): Promise<string> {
  const dir = queueDir();
  const safeName = params.fileName.replace(/[^\w.\-]+/g, "_");
  const destName = `${Date.now()}_${safeName}`;
  const dest = new File(dir, destName);

  const source = new File(params.sourceUri);
  if (!source.exists) {
    throw new Error("Source media file not found");
  }

  await source.copy(dest);
  return dest.uri;
}

export async function deletePersistedOfflineMedia(uri: string | undefined) {
  if (!uri) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    /* noop */
  }
}
