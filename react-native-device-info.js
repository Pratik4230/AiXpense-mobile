import Constants from "expo-constants";

/** Expo-friendly shim — sp-react-native-in-app-updates expects react-native-device-info. */
export const getBundleId = () => {
  return (
    Constants.expoConfig?.android?.package ??
    Constants.expoConfig?.ios?.bundleIdentifier ??
    ""
  );
};

export const getVersion = () => {
  return Constants.expoConfig?.version ?? "1.0.0";
};

export default {
  getBundleId,
  getVersion,
};
