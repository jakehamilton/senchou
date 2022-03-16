import Coder from "@littlethings/coder";
import { render, template, TemplatedValue, TemplateInput } from ".";

export type IncludeData<T> = {
	name: string;
	context?: string;
};

export type IncludeTemplate<T> = T & {
	__templateType: "include";
	__data: IncludeData<T>;
};

export const isIncludeTemplate = <T>(
	value: any
): value is IncludeTemplate<T> => {
	return (
		value !== null &&
		(value as IncludeTemplate<T>)?.__templateType === "include"
	);
};

type SerializeOptions<T> = {
	// prettier-ignore
	type:
		T extends Array<infer U>
			? ArrayConstructor
		: T extends object
		  ? ObjectConstructor
		: never;
	name: string;
	context?: string;
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

	const output: IncludeTemplate<T> = value as unknown as IncludeTemplate<T>;

	output.__templateType = "include";
	output.__data = {
		name: options.name,
		context: options.context,
	};

	return output;
};

export const deserialize = <T extends TemplateInput>(
	coder: Coder,
	value: IncludeTemplate<T>,
	inline = false
) => {
	const { name, context } = value.__data;

	const filterText = ` | nindent ${coder.currentIndent * coder.indentAmount}`;

	const code = `{{- include "${name}"${
		context ? ` ${context}` : ""
	}${filterText} }}`;

	if (inline) {
		return code;
	} else {
		coder.line(code);
	}
};
