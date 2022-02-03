import log from "../util/log";
import * as api from "../api/github";
import { CustomResourceDefinition } from "../util/crd";

/**
 * A regex that will match:
 *
 * github:                               | A prefix to specify a GitHub import
 *        owner                          | The name of the account that owns the repository
 *             /                         |
 *              name                     | The name of the repository
 *                  @                    | Enables the optional version specifier
 *                   major               | When specifying a version, the major number is required
 *                        .              |
 *                         minor         | When specifying a version, the minor number is required
 *                              .        | Enables the optional patch version number
 *                               patch   | An optional patch version to specify
 *
 * Examples:
 *
 * github:jakehamilton/packages
 * github:jakehamilton/packages@1.0
 * github:jakehamilton/packages@1.0.1
 */
const GITHUB_REGEX =
	/^(?<owner>[A-Za-z0-9_.-]+)\/(?<name>[A-Za-z0-9_.-]+)(?:\@(?<major>[0-9]+)\.(?<minor>[0-9]+)(?:\.(?<patch>[0-9]+))?)?$/;

const getDocPath = (specifier: string) => {
	const match = GITHUB_REGEX.exec(specifier);

	if (!match) {
		throw new Error(`Specifier is not a valid GitHub import: ${specifier}`);
	}

	const { owner, name, major, minor, patch } = match.groups as {
		owner: string;
		name: string;
		major?: string;
		minor?: string;
		patch?: string;
	};

	if (major && minor) {
		return `github.com/${owner}/${name}@v${major}.${minor}.${patch ?? "0"}`;
	} else {
		return `github.com/${owner}/${name}`;
	}
};

const source = {
	import: async (specifier: string) => {
		const path = getDocPath(specifier);

		log.trace({ resolved: path });

		const data = await api.get(path);

		return data;
	},
};

export default source;
