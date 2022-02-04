import { defineConfig } from "vite";

export default defineConfig({
	build: {
		lib: {
			entry: "./src/index.ts",
			formats: ["cjs", "es"],
			fileName: (format) => `senchou.${format}.js`,
		},
		rollupOptions: {
			external: ["@senchou/core", "@senchou/cli", "@littlethings/log"],
		},
	},
});
