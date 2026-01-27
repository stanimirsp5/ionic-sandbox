import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "demo.push.notifiations",
  appName: "demo.push.notifiations",
  webDir: "dist",
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
