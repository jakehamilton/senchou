import fs from "fs";
import path from "path";
import { CodeMaker } from "codemaker";
import { JSONSchema4 } from "json-schema";
import { TypeGenerator } from "json2jsii";
import log from "../../util/log";
import { parseAPIName } from "./util/api-name";
import emitApiObject from "./util/emit-api-object";

import getApiObjects from "./util/get-api-objects";
import getTypeName from "./util/get-type-name";

export const isKubernetes = (input: any) => {
	return (
		input &&
		typeof input === "object" &&
		input.definitions &&
		Object.keys(input.definitions).some((key) => key.startsWith("io.k8s"))
	);
};

const generator = (schema: JSONSchema4) => {
	const code = new CodeMaker();

	const apiObjects = getApiObjects(schema);

	// fs.writeFileSync(
	// 	path.resolve(__dirname, "schema.json"),
	// 	JSON.stringify(schema.definitions, null, 2)
	// );

	const typeGenerator = new TypeGenerator({
		definitions: schema.definitions,
		renderTypeName: getTypeName,
	});

	for (const apiObject of apiObjects) {
		const propsName = TypeGenerator.normalizeTypeName(
			`${getTypeName(apiObject.fullName)}Props`
		);
		typeGenerator.addDefinition(apiObject.fullName, {
			$ref: `#/definitions/${propsName}`,
		});
	}

	for (const apiObject of apiObjects) {
		emitApiObject(apiObject, typeGenerator);
	}

	const rendered = typeGenerator
		.render()
		// Export with the object's type
		.replaceAll(
			"return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {});",
			"return Object.entries(result).reduce((r, i) => (i[1] === undefined) ? r : ({ ...r, [i[0]]: i[1] }), {}) as typeof result;"
		)
		// Remove the default return value from `toJson_*` functions since they're not useful
		// in TypeScript. Instead, we'll get the real returned value as the type.
		.replaceAll(": Record<string, any> | undefined {", " {");

	const fileName = "k8s.ts";

	code.indentCharacter = "\t";
	code.indentation = 1;

	code.openFile(fileName);

	code.line(rendered);

	code.closeFile(fileName);

	code.save(__dirname);
};

export default generator;
