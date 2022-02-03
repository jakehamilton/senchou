import { defineConfig } from "vite";

export default defineConfig({
	build: {
		sourcemap: "inline",
		lib: {
			entry: "./src/index.ts",
			formats: ["cjs", "es"],
			fileName: (format) => `core.${format}.js`,
		},
		rollupOptions: {
			external: [
				"os",
				"fs",
				"fs/promises",
				"child_process",
				"path",
				"https",
				"@littlethings/log",
				"json-schema",
			],
		},
	},
});
