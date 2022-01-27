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
				"fs",
				"path",
				"https",
				"@littlethings/log",
				"codemaker",
				"json-schema",
				"json2ii",
			],
		},
	},
});
