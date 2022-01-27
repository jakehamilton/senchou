import { JSONSchema4 } from "json-schema";
import { TypeGenerator } from "json2jsii";
import { X_KUBERNETES_GROUP_VERSION_KIND } from "./get-api-object-name";
import { APIObject } from "./get-api-objects";
import getTypeName from "./get-type-name";

const emitApiObject = (apiObject: APIObject, typeGenerator: TypeGenerator) => {
	const name = getTypeName(apiObject.fullName);

	if (apiObject.custom) {
		typeGenerator.emitCustomType("ApiObjectMetadata", () => {});
	}

	typeGenerator.emitCustomType(name, (code) => {
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
			return typeGenerator.emitType(
				TypeGenerator.normalizeTypeName(`${name}Props`),
				createPropsSchema(),
				apiObject.fullName
			);
		};

		const propsTypeName = emitProps();
		const hasRequired =
			apiObject.schema.required &&
			Array.isArray(apiObject.schema.required) &&
			apiObject.schema.required.length > 0;

		const defaultProps = hasRequired ? "" : " = {}";

		const emitGroupVersionKind = () => {
			code.line("/**");
			code.line(
				` * Returns the apiVersion and kind for "${apiObject.fullName}"`
			);
			code.line(" */");
			code.openBlock(`public static readonly GVK: GroupVersionKind =`);
			code.line(
				`apiVersion: '${apiObject.group ? `${apiObject.group}/` : ""}${
					apiObject.version
				}',`
			);
			code.line(`kind: '${apiObject.kind}',`);
			code.closeBlock();
		};

		const emitInitializer = () => {
			code.line("/**");
			code.line(` * Defines a "${apiObject.fullName}" API object`);
			code.line(
				" * @param scope the scope in which to define this object"
			);
			code.line(" * @param id a scope-local name for the object");
			code.line(" * @param props initialization props");
			code.line(" */");

			code.openBlock(
				`public constructor(scope: Construct, id: string, props: ${propsTypeName}${defaultProps})`
			);

			code.open("super(scope, id, {");
			code.line(`...${name}.GVK,`);
			code.line("...props,");
			code.close("});");

			code.closeBlock();
		};

		const emitManifestFactory = () => {
			code.line("/**");
			code.line(
				` * Renders a Kubernetes manifest for "${apiObject.fullName}".`
			);
			code.line(" *");
			code.line(
				" * This can be used to inline resource manifests inside other objects (e.g. as templates)."
			);
			code.line(" *");
			code.line(" * @param props initialization props");
			code.line(" */");

			code.openBlock(
				`public static manifest(props: ${propsTypeName}${defaultProps}): any`
			);
			code.open("return {");
			code.line(`...${name}.GVK,`);
			code.line(`...toJson_${propsTypeName}(props),`);
			code.close("};");
			code.closeBlock();
		};

		const emitToJSON = () => {
			code.line("/**");
			code.line(" * Renders the object to Kubernetes JSON.");
			code.line(" */");
			code.openBlock("public toJson(): any");
			code.line("const resolved = super.toJson();");
			code.line();
			code.open("return {");
			code.line(`...${name}.GVK,`);
			code.line(`...toJson_${propsTypeName}(resolved),`);
			code.close("};");
			code.closeBlock();
		};

		const emit = () => {
			code.line("/**");
			code.line(` * ${apiObject.schema?.description ?? ""}`);
			code.line(" *");
			code.line(` * @schema ${apiObject.fullName}`);
			code.line(" */");
			code.openBlock(
				`export const ${name} = (props: ${propsTypeName}${defaultProps}) =>`
			);

			code.open("return {");
			code.line(
				`apiVersion: '${apiObject.group ? `${apiObject.group}/` : ""}${
					apiObject.version
				}' as const,`
			);
			code.line(`kind: '${apiObject.kind}' as const,`);
			code.line(`...toJson_${propsTypeName}(props),`);
			code.close("};");

			code.closeBlock();
		};

		emit();
	});
};

export default emitApiObject;
