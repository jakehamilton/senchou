import log from "../util/log";
import * as api from "../api/kubernetes";
import { JSONSchema4 } from "json-schema";
import getApiObjects from "../util/get-api-objects";
import Schemer, { normalize } from "@littlethings/schemer";
import getTypeName from "../util/get-type-name";
import emitApiObject from "../util/emit-api-object";

const DEFAULT_KUBERNETES_VERSION = "1.22.0";

const KUBERNETES_REGEX = /^(?:@(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+))?/;

const getVersion = (version: string) => {
	const match = KUBERNETES_REGEX.exec(version);

	if (!match) {
		throw new Error(
			`Specifier is not a valid Kubernetes import: ${version}`
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

const source = {
	import: async (version?: string) => {
		const resolvedVersion = version
			? getVersion(version)
			: DEFAULT_KUBERNETES_VERSION;

		log.trace({ resolved: resolvedVersion });

		const data = await api.get(resolvedVersion);

		return data;
	},
	generate: (schema: JSONSchema4) => {
		const apiObjects = getApiObjects(schema);

		const schemer = new Schemer({
			schemas: schema.definitions,
			serializers: {
				name: getTypeName,
			},
		});

		for (const apiObject of apiObjects) {
			const propsName = normalize(
				`${getTypeName(apiObject.fullName)}Props`
			);
			schemer.alias(apiObject.fullName, propsName);
		}

		for (const apiObject of apiObjects) {
			emitApiObject(apiObject, schemer);
		}

		return schemer.render();
	},
};

export default source;
