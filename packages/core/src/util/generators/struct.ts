import Coder from "@littlethings/coder";
import {
	camel,
	normalize,
	isRequired,
	Struct,
	Type,
	Schema,
} from "@littlethings/schemer";

export interface StructGeneratorOptions {
	coder: Coder;
	name: string;
	schema: Struct;
	serializers: {
		name: (identifier: string) => string;
	};
	emit: (name: string, schema: Schema) => Type;
}

const generate = ({
	coder,
	name,
	schema,
	serializers,
	emit,
}: StructGeneratorOptions) => {
	let additionalPropertiesType: Type | null = null;

	if (
		schema.additionalProperties &&
		typeof schema.additionalProperties === "object"
	) {
		const additionalPropertiesTypeName = normalize(
			serializers.name(`${name}.additionalProperties`)
		);

		additionalPropertiesType = emit(
			additionalPropertiesTypeName,
			schema.additionalProperties
		);
	}

	const props: Array<{
		name: string;
		safeName: string;
		type: Type;
		required: boolean;
	}> = [];

	for (const [propName, propSchema] of Object.entries(schema.properties)) {
		const propTypeName = normalize(serializers.name(`${name}.${propName}`));

		props.push({
			name: propName,
			safeName: camel(propName),
			type: emit(propTypeName, propSchema),
			required: isRequired(schema, propName),
		});
	}

	coder.openBlock(`export type ${name} =`);
	for (const prop of props) {
		coder.line(
			`readonly ${prop.safeName}${prop.required ? "" : "?"}: ${
				prop.type.type
			};`
		);
	}
	coder.closeBlock(
		additionalPropertiesType
			? ` & Record<string, ${additionalPropertiesType.type}>;`
			: ";"
	);

	coder.line();

	coder.openBlock(`export type Serialized${name} =`);
	for (const prop of props) {
		coder.line(
			`"${prop.name}"${prop.required ? "" : "?"}: ${
				prop.type.serializedType
			},`
		);
	}
	coder.closeBlock(
		additionalPropertiesType
			? ` & Record<string, ${additionalPropertiesType.type}>`
			: ";"
	);

	coder.line();

	coder.line(
		`export function serialize${name}(options: undefined): undefined;`
	);
	coder.line(
		`export function serialize${name}(options: ${name}): Serialized${name};`
	);
	coder.line(
		`export function serialize${name}(options: ${name} | undefined): Serialized${name} | undefined;`
	);
	coder.openBlock(
		`export function serialize${name}(options: ${name} | undefined): Serialized${name} | undefined`
	);
	coder.line("if (options === undefined) return undefined;");
	if (additionalPropertiesType) {
		coder.line(
			`const additionalPropertiesKeys = Object.keys(options).filter(key => ![${props
				.map((prop) => `"${prop.safeName}"`)
				.join(", ")}].includes(key));`
		);

		coder.line();

		coder.line(`const additionalProperties: Record<string, any> = {};`);

		coder.line();

		coder.openBlock(`for (const key of additionalPropertiesKeys)`);
		coder.line(`additionalProperties[key] = options[key];`);
		coder.closeBlock();

		coder.line();
	}
	coder.openBlock(`const result: Serialized${name} =`);
	for (const prop of props) {
		coder.line(
			`"${prop.name}": ${prop.type.serialize(
				`options.${prop.safeName}`
			)},`
		);
	}
	if (additionalPropertiesType) {
		coder.line(
			`...(${additionalPropertiesType.serialize(
				"additionalProperties"
			)}),`
		);
	}
	coder.closeBlock(";");
	coder.line();

	// @NOTE(jakehamilton): Add compatibility for using `@senchou/helm`
	// to template structs. For example, `template.object(".Values.x")`.
	coder.line("return senchou.wrapTemplate(options, result);");
	// coder.line(`// @ts-ignore`);
	// coder.openBlock(`if (options.__templateType !== undefined)`);
	// coder.line(`// @ts-ignore`);
	// coder.line(`result.__templateType = options.__templateType;`);
	// coder.line(`// @ts-ignore`);
	// coder.line(`result.__data = options.__data;`);
	// coder.closeBlock();

	// coder.line();
	// coder.line("return result;");
	coder.closeBlock();
};

export default generate;
