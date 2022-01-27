import { Specifier } from "../types/specifier";
import log from "../util/log";
import github, { isGitHub } from "./github";
import kubernetes, { isKubernetes } from "./kubernetes";

const importer = async (specifier: string) => {
	if (isGitHub(specifier)) {
		log.trace({ importer: "github" });
		return await github(specifier);
	} else if (isKubernetes(specifier)) {
		log.trace({ importer: "kubernetes" });
		return await kubernetes(specifier);
	} else {
		throw new Error(`Unknown specifier "${specifier}".`);
	}
};

export default importer;
