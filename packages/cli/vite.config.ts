import { defineConfig } from "vite";

export default defineConfig({
	build: {
		lib: {
			entry: "./src/index.ts",
			formats: ["cjs", "es"],
			fileName: (format) => `cli.${format}.js`,
		},
		rollupOptions: {
			external: ["https"],
		},
	},
});
