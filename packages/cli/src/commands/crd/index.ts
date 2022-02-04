import fs from "fs";
import path from "path";
import mkdirp from "mkdirp";
import core from "@senchou/core";

import help from "./help";
import getArgs from "./args";
import log from "../../util/log";
import { resolveRelativePath } from "../../util/path";
import { importCRD, specifierToFileName } from "../../util/crd";

const command = async () => {
	const args = getArgs();

	if (args["--help"]) {
		help();
		process.exit(0);
	}

	if (!args._[1]) {
		log.fatal("No specifier entered.");
		help();
		process.exit(1);
	}

	const specifier = args._[1];

	const output = args["--output"]
		? resolveRelativePath(args["--output"])
		: resolveRelativePath("senchou");

	const name = args["--name"]
		? args["--name"]
		: specifierToFileName(specifier);

	log.trace(`Using name "${name}" for resource.`);

	log.debug(`Creating directory "${output}".`);

	await mkdirp(output);

	const file = path.resolve(output, `${name}.ts`);

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

	log.trace(`Importing definitions for "${specifier}".`);
	const definitions = await importCRD(specifier);

	log.trace(`Generating code for definitions.`);
	const code = await core.generate.crd(definitions);

	log.debug(`Writing code to file "${file}".`);

	fs.writeFileSync(file, code);
};

export default command;
