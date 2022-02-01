import Schemer, { normalize } from "@littlethings/schemer";
import { JSONSchema4 } from "json-schema";

import getTypeName from "./util/get-type-name";
import emitApiObject from "./util/emit-api-object";
import getApiObjects from "./util/get-api-objects";

export const isKubernetes = (input: any) => {
	return (
		input &&
		typeof input === "object" &&
		input.definitions &&
		Object.keys(input.definitions).some((key) => key.startsWith("io.k8s"))
	);
};

const generator = (schema: JSONSchema4) => {
	const apiObjects = getApiObjects(schema);

	const schemer = new Schemer({
		schemas: schema.definitions,
		serializers: {
			name: getTypeName,
		},
	});

	for (const apiObject of apiObjects) {
		const propsName = normalize(`${getTypeName(apiObject.fullName)}Props`);
		schemer.alias(apiObject.fullName, propsName);
	}

	for (const apiObject of apiObjects) {
		emitApiObject(apiObject, schemer);
	}

	return schemer.render();
};

export default generator;
