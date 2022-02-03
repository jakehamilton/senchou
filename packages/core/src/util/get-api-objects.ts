import { JSONSchema4 } from "json-schema";

import { parseAPIName } from "./api-name";
import getObjectName, { GroupVersionKind } from "./get-api-object-name";

export interface APIObject extends GroupVersionKind {
	custom: boolean;
	fullName: string;
	schema: JSONSchema4;
}

const getApiObjects = (schema: JSONSchema4 = {}): Array<APIObject> => {
	const { definitions } = schema;

	const apiObjects: Array<APIObject> = [];

	if (!definitions) {
		return apiObjects;
	}

	for (const [fullName, apiObjectSchema] of Object.entries(definitions)) {
		const apiObjectName = getObjectName(apiObjectSchema);

		if (!apiObjectName) {
			// We only generate code for manifests for API objects
			// that have a name. Additionally, we only care about
			// API objects that have `properties.metadata` set.
			continue;
		}

		const apiObjectType = parseAPIName(fullName);

		if (!apiObjectType.version) {
			throw new Error(
				`Unable to parse version for API object "${fullName}".`
			);
		}

		const apiObject: APIObject = {
			...apiObjectName,
			custom: false,
			fullName,
			schema: apiObjectSchema,
		};

		apiObjects.push(apiObject);
	}

	return apiObjects;
};

export default getApiObjects;
