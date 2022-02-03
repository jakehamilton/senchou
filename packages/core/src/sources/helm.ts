import os from "os";
import path from "path";
import yaml from "js-yaml";
import { execSync } from "child_process";
import { mkdtemp, writeFile } from "fs/promises";

export interface HelmOptions {
	name: string;
	chart: string;
	args?: Array<string>;
	values?: object;
}

const source = {
	import: async (options: HelmOptions) => {
		const tmp = await mkdtemp(path.join(os.tmpdir(), "senchou-helm-"));

		const valuesFile = path.join(tmp, "values.yaml");

		if (options.values) {
			const values = yaml.dump(options.values);

			await writeFile(valuesFile, values);
		}

		const valuesArg = options.values ? `--values ${valuesFile}` : "";
		const customArgs = options.args ? options.args.join(" ") : "";

		const buffer = execSync(
			`helm template ${options.name} ${options.chart} ${valuesArg} ${customArgs}`,
			{
				cwd: tmp,
				stdio: "pipe",
			}
		);

		const resources = yaml.loadAll(buffer.toString("utf-8"));

		return resources;
	},
};

export default source;
