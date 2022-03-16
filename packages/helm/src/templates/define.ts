import Coder from "@littlethings/coder";
import { render, template, TemplatedValue, TemplateInput } from ".";

export type DefineData<T> = {
	body: T;
	name: string;
};

export type DefineTemplate<T> = T & {
	__templateType: "define";
	__data: DefineData<T>;
};

export const isDefineTemplate = <T>(value: any): value is DefineTemplate<T> => {
	return (
		value !== null &&
		(value as DefineTemplate<T>)?.__templateType === "define"
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
	body: T;
	name: string;
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

	const output: DefineTemplate<T> = value as unknown as DefineTemplate<T>;

	output.__templateType = "define";
	output.__data = {
		body: options.body,
		name: options.name,
	};

	return output;
};

export const deserialize = <T extends TemplateInput>(
	coder: Coder,
	value: DefineTemplate<T>
) => {
	const { body, name } = value.__data;

	coder.line(`{{- define "${name}" }}`);

	render(body, coder);

	coder.line("{{- end }}");
};
