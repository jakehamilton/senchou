import { Specifier } from "../../types/specifier";
import * as api from "../../util/k8s-schema-api";
import log from "../../util/log";

const DEFAULT_KUBERNETES_VERSION = "1.22.0";

const KUBERNETES_REGEX =
	/^k8s(?:@(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+))?/;

export const isKubernetes = (
	specifier: string
): specifier is Specifier<typeof specifier> => {
	return KUBERNETES_REGEX.test(specifier);
};

const getVersion = <T extends string>(specifier: Specifier<T>) => {
	const match = KUBERNETES_REGEX.exec(specifier);

	if (!match) {
		throw new Error(
			`Specifier is not a valid Kubernetes import: ${specifier}`
		);
	}

	const { major, minor, patch } = match.groups as {
		major?: string;
		minor?: string;
		patch?: string;
	};

	if (major && minor && patch) {
		return `${major}.${minor}.${patch}`;
	} else {
		log.trace(
			`No kubernetes version specified, defaulting to "${DEFAULT_KUBERNETES_VERSION}".`
		);
		return DEFAULT_KUBERNETES_VERSION;
	}
};

const importer = async <T extends string>(specifier: Specifier<T>) => {
	const version = getVersion(specifier);

	log.trace({ resolved: version });

	const data = await api.get(version);

	return data;
};

export default importer;
