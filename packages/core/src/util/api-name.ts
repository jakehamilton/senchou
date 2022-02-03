import { APILevel } from "./api-levels";

export interface APIName {
	fullName: string;
	kind: string;
	namespace: string;
	version: null | {
		raw: string;
		major: number;
		minor: number;
		level: string;
	};
}

/**
 * Matches an API version of the forms:
 *
 * @example
 * v1
 * v1stable1
 */
const VERSION_REGEX = /^v(?<major>[0-9]+)((?<level>[a-z]+)(?<minor>[0-9]+))?$/;

/**
 * Parses Kubernetes API names to a standard object format.
 *
 * @example
 * parseAPIName("io.k8s.api.scheduling.v1alpha1.PriorityClass")
 * {
 * 	fullName: "io.k8s.api.scheduling.v1alpha1.PriorityClass",
 * 	kind: "PriorityClass",
 * 	namespace: "io.k8s.api.scheduling",
 * 	version: {
 * 		raw: "v1alpha1",
 * 		major: 1,
 * 		minor: 1,
 * 		level: "alpha"
 * 	},
 * }
 */
export const parseAPIName = (fullName: string) => {
	const parts = fullName.split(".");
	const kind = parts[parts.length - 1];

	const namespace = parts.slice(0, parts.length - 2).join("");
	const version = parts[parts.length - 2];

	const match = VERSION_REGEX.exec(version);

	const result: APIName = {
		fullName,
		kind,
		// Sometimes we won't have a version specified. In which case,
		// the string contained within `version` actually belongs to
		// the namespace.
		namespace: match ? namespace : `${namespace}.${version}`,
		version: match
			? {
					raw: match[0],
					major: parseInt(match.groups!.major),
					minor: parseInt(match.groups!.minor ?? 0),
					level: match.groups!.level ?? APILevel.Stable,
			  }
			: null,
	};

	return result;
};
