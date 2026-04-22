const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return 'com.aixpense.app.dev';
  }

  if (IS_PREVIEW) {
    return 'com.aixpense.app.preview';
  }

  return 'com.aixpense.app';
};

const getAppName = () => {
  if (IS_DEV) {
    return 'AiXpense (Dev)';
  }

  if (IS_PREVIEW) {
    return 'AiXpense (Preview)';
  }

  return 'AiXpense';
};

export default ({ config }) => ({
  ...config,
  name: getAppName(),
  ios: {
    ...config.ios,
    bundleIdentifier: getUniqueIdentifier(),
  },
  android: {
    ...config.android,
    package: getUniqueIdentifier(),
  },
});
