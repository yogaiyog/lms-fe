import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.lms.coding",
  appName: process.env.NEXT_PUBLIC_COMPANY_NAME || "lms-coding",
  webDir: "out",
  server: {
    androidScheme: "http",
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
