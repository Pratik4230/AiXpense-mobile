const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return "com.aixpense.app.dev";
  }

  if (IS_PREVIEW) {
    return "com.aixpense.app.preview";
  }

  return "com.aixpense.app";
};

const getAppName = () => {
  if (IS_DEV) {
    return "AiXpense Dev";
  }

  if (IS_PREVIEW) {
    return "AiXpense Preview";
  }

  return "AiXpense";
};

const getScheme = () => {
  if (IS_DEV) {
    return "aixpense-dev";
  }

  if (IS_PREVIEW) {
    return "aixpense-preview";
  }

  return "aixpense";
};

/** Used by Better Auth / SecureStore so dev and prod installs do not share keys. */
const getStoragePrefix = () => {
  if (IS_DEV) {
    return "aixpense-dev";
  }

  if (IS_PREVIEW) {
    return "aixpense-preview";
  }

  return "aixpense";
};

export default ({ config }) => ({
  ...config,
  name: getAppName(),
  scheme: getScheme(),
  ios: {
    ...config.ios,
    bundleIdentifier: getUniqueIdentifier(),
  },
  android: {
    ...config.android,
    package: getUniqueIdentifier(),
  },
  extra: {
    ...config.extra,
    appVariant: process.env.APP_VARIANT ?? "production",
    storagePrefix: getStoragePrefix(),
  },
});
