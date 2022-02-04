import { defineConfig } from "vite";

export default defineConfig({
	build: {
		lib: {
			entry: "./src/index.ts",
			formats: ["cjs", "es"],
			fileName: (format) => `cli.${format}.js`,
		},
		rollupOptions: {
			external: [
				"@littlethings/log",
				"@senchou/core",
				"arg",
				"kleur",
				"path",
				"fs",
				"mkdirp",
			],
		},
	},
});
