import { createMMKV } from "react-native-mmkv";

export const storage = createMMKV({ id: "aixpense" });

export const THEME_KEY = "theme_preference";
