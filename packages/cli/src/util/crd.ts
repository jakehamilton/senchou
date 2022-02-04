import core from "@senchou/core";
import log from "./log";

export enum Protocols {
	GitHub = "github:",
}

export const specifierToFileName = (specifier: string) => {
	if (specifier.startsWith("github:")) {
		const suffix = specifier.split("github:")[1];

		const path = suffix.split("@")[0];

		const repo = path.split("/")[1];

		return repo;
	} else {
		return specifier.replace(/[^A-Za-z0-9]/g, "-");
	}
};

export const importCRD = async (specifier: string) => {
	if (specifier.startsWith(Protocols.GitHub)) {
		return core.import.github(specifier.substring(Protocols.GitHub.length));
	} else {
		log.fatal(`Unknown protocol "${specifier}" for CRD.`);
		process.exit(1);
	}
};
