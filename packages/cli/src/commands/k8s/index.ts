import fs from "fs";
import path from "path";
import mkdirp from "mkdirp";
import core from "@senchou/core";

import help from "./help";
import getArgs from "./args";
import { resolveRelativePath } from "../../util/path";
import log from "../../util/log";

const command = async () => {
	const args = getArgs();

	if (args["--help"]) {
		help();
		process.exit(0);
	}

	const output = args["--output"]
		? resolveRelativePath(args["--output"])
		: resolveRelativePath("senchou");

	const version: string | undefined = args._[1];

	log.debug(`Creating directory "${output}".`);

	await mkdirp(output);

	const file = path.resolve(output, "k8s.ts");

	if (fs.existsSync(file)) {
		if (args["--force"]) {
			fs.rmSync(file);
		} else {
			log.fatal(`File already exists at path "${file}".`);
			log.fatal(
				`Remove the file and try again or use the "--force" option.`
			);
			process.exit(1);
		}
	}

	const specifier = `k8s${version ? `@${version}` : ""}`;

	log.trace(`Importing schema for "${specifier}".`);
	const schema = await core.import.kubernetes(specifier);

	log.trace(`Generating code for schema.`);
	const code = await core.generate.kubernetes(schema);

	log.debug(`Writing code to file "${file}".`);

	fs.writeFileSync(file, code);
};

export default command;
