import Schemer, { normalize } from "@littlethings/schemer";
import { JSONSchema4 } from "json-schema";
import { X_KUBERNETES_GROUP_VERSION_KIND } from "./get-api-object-name";
import { APIObject } from "./get-api-objects";
import getTypeName from "./get-type-name";

const emitApiObject = (apiObject: APIObject, schemer: Schemer) => {
	const name = getTypeName(apiObject.fullName);

	if (apiObject.custom) {
		schemer.emit("OwnerReference", {
			type: "object",
			required: ["apiVersion", "kind", "name", "uid"],
			properties: {
				apiVersion: {
					type: "string",
				},
				kind: {
					type: "string",
				},
				name: {
					type: "string",
				},
				uid: {
					type: "string",
				},
				controller: {
					type: "boolean",
				},
				blockOwnerDeletion: {
					type: "boolean",
				},
			},
		});

		schemer.emit("ApiObjectMetadata", {
			type: "object",
			additionalProperties: {},
			properties: {
				name: {
					type: "string",
				},
				namespace: {
					type: "string",
				},
				annotations: {
					type: "object",
					additionalProperties: {
						type: "string",
					},
				},
				labels: {
					type: "object",
					additionalProperties: {
						type: "string",
					},
				},
				finalizers: {
					type: "array",
					additionalItems: {
						type: "string",
					},
				},
				ownerReferences: {
					type: "array",
					additionalItems: {
						$ref: "#/definitions/OwnerReference",
					},
				},
			},
		});
	}

	schemer.emit(name, (coder) => {
		const createPropsSchema = () => {
			const schemaCopy: JSONSchema4 = {
				...apiObject.schema,
				required: apiObject.schema.required ?? [],
				properties: apiObject.schema.properties || {},
			};

			delete schemaCopy[X_KUBERNETES_GROUP_VERSION_KIND];

			const props = schemaCopy.properties!;

			delete props.apiVersion;
			delete props.kind;
			delete props.status;

			if (Array.isArray(schemaCopy.required)) {
				schemaCopy.required = schemaCopy.required.filter(
					(name) =>
						name !== "apiVersion" &&
						name !== "kind" &&
						name !== "status"
				);
			}

			if (apiObject.custom) {
				schemaCopy.properties!.metadata = {
					$ref: "#/definitions/ApiObjectMetadata",
				};
			}

			return schemaCopy;
		};

		const emitProps = () => {
			return schemer.emit(normalize(`${name}Props`), createPropsSchema());
		};

		const propsTypeName = emitProps();
		const hasRequired =
			apiObject.schema.required &&
			Array.isArray(apiObject.schema.required) &&
			apiObject.schema.required.length > 0;

		const defaultProps = hasRequired ? "" : " = {}";

		const emit = () => {
			const apiVersion = `${
				apiObject.group ? `${apiObject.group}/` : ""
			}${apiObject.version}`;

			coder.openBlock(`export type Serialized${name} =`);
			coder.line(
				`apiVersion: "${apiObject.group ? `${apiObject.group}/` : ""}${
					apiObject.version
				}";`
			);
			coder.line(`kind: "${apiObject.kind}";`);
			coder.closeBlock(` & ${propsTypeName.serializedType};`);

			coder.openBlock(
				`export const is${name} = (input: any): input is Serialized${name} =>`
			);
			coder.line(`return (`);
			coder.indent();
			coder.line(`typeof input === "object" &&  `);
			coder.line(`input !== null &&`);
			coder.line(`input.apiVersion === "${apiVersion}" &&`);
			coder.line(`input.kind === "${apiObject.kind}"`);
			coder.dedent();
			coder.line(`);`);
			coder.closeBlock(";");

			coder.line("/**");
			coder.line(` * ${apiObject.schema?.description ?? ""}`);
			coder.line(" *");
			coder.line(` * @schema ${apiObject.fullName}`);
			coder.line(" */");
			coder.openBlock(
				`export const ${name} = (props: ${propsTypeName.type}${defaultProps}) =>`
			);

			coder.openBlock("return senchou.wrapTemplate(props,");
			coder.indent();
			coder.line(`apiVersion: "${apiVersion}" as const,`);
			coder.line(`kind: "${apiObject.kind}" as const,`);
			coder.line(`...serialize${propsTypeName.type}(props),`);
			coder.dedent();
			coder.closeBlock(");");

			coder.closeBlock();
		};

		emit();

		return {
			type: propsTypeName.type,
			serialize: (identifier) => `${name}(${identifier})`,
			serializedType: `Serialized${name}`,
		};
	});
};

export default emitApiObject;
