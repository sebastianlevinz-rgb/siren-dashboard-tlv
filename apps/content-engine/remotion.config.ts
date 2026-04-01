import { Config } from "@remotion/cli/config";
import path from "path";

Config.setEntryPoint("./src/index.ts");

Config.overrideWebpackConfig((config) => {
  return {
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        "@war/shared": path.resolve(__dirname, "../../packages/shared"),
      },
    },
  };
});
