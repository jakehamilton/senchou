import Coder from "@littlethings/coder";
import { render, template, TemplatedValue, TemplateInput } from ".";
import { ElseIfTemplate } from "./elseif";

export type IfData<T> = {
	condition: string;
	body: T;
	else?: ElseIfTemplate<T> | T; // @TODO(jakehamilton): add ElseTemplate.
};

export type IfTemplate<T> = T & {
	__templateType: "if";
	__data: IfData<T>;
};

export const isIfTemplate = <T>(value: any): value is IfTemplate<T> => {
	return value !== null && (value as IfTemplate<T>)?.__templateType === "if";
};

type SerializeOptions<T> = {
	// prettier-ignore
	type:
		T extends Array<infer U>
			? ArrayConstructor
		: T extends object
		  ? ObjectConstructor
		// @NOTE(jakehamilton): I think conditional blocks are only
		// possible for objects and arrays, so these constructors
		// don't need to be checked.
		// : T extends number
		// 	? NumberConstructor
		// : T extends string
		// 	? StringConstructor
		// : T extends boolean
		// 	? BooleanConstructor
		: never;
	condition: string;
	body: T;
	else?: ElseIfTemplate<T> | T;
};

export const serialize = <T>(options: SerializeOptions<T>): T => {
	let value;

	switch (options.type) {
		case Array:
			value = [];
			break;
		case Object:
			value = {};
			break;
	}

	const output: IfTemplate<T> = value as unknown as IfTemplate<T>;

	output.__templateType = "if";
	output.__data = {
		condition: options.condition,
		body: options.body,
		else: options.else,
	};

	return output;
};

export const deserialize = <T extends TemplateInput>(
	coder: Coder,
	value: IfTemplate<T>
) => {
	const { condition, body } = value.__data;
	// {{- if eq .type "secret" }}
	// secret:
	// 	secretName: {{ tpl (.name) $root }}
	// {{- else if eq .type "configMap" }}
	// configMap:tpl
	// 	name: {{ tpl (.name) $root }}
	// {{- end }}
	coder.line(`{{- if ${condition} }}`);
	render(body, coder);

	let _else = value.__data.else;

	while (_else !== undefined) {
		if (isIfTemplate<T>(_else)) {
			coder.line(`{{- else if ${_else.__data.condition} }}`);
			render(_else.__data.body, coder);

			_else = _else.__data.else;
		} else {
			coder.line("{{- else }}");
			render(_else, coder);

			_else = undefined;
		}
	}

	coder.line("{{- end }}");
};
