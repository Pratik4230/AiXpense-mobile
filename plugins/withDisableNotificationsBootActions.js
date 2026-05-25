const { withAndroidManifest } = require("@expo/config-plugins");

/**
 * Removes BOOT_COMPLETED from expo-notifications NotificationsService for Android 15+.
 * @see https://github.com/expo/expo/issues/41627
 */
function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

module.exports = function withDisableNotificationsBootActions(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    manifest.manifest.$ = manifest.manifest.$ || {};
    if (!manifest.manifest.$["xmlns:tools"]) {
      manifest.manifest.$["xmlns:tools"] = "http://schemas.android.com/tools";
    }

    const app = manifest.manifest.application?.[0];
    if (!app) return config;

    const targetName = "expo.modules.notifications.service.NotificationsService";
    const replacementReceiver = {
      $: {
        "android:name": targetName,
        "android:enabled": "true",
        "android:exported": "false",
        "tools:node": "replace",
      },
      "intent-filter": [
        {
          $: { "android:priority": "-1" },
          action: [
            {
              $: {
                "android:name": "expo.modules.notifications.NOTIFICATION_EVENT",
              },
            },
          ],
        },
      ],
    };

    const receivers = asArray(app.receiver);
    const idx = receivers.findIndex(
      (r) => r?.$?.["android:name"] === targetName,
    );
    if (idx >= 0) receivers[idx] = replacementReceiver;
    else receivers.push(replacementReceiver);
    app.receiver = receivers;

    return config;
  });
};
