import Coder from "@littlethings/coder";
import { render, template, TemplatedValue, TemplateInput } from ".";

export type RangeData<T> = {
	body: T;
	expression: string;
};

export type RangeTemplate<T> = T & {
	__templateType: "range";
	__data: RangeData<T>;
};

export const isRangeTemplate = <T>(value: any): value is RangeTemplate<T> => {
	return (
		value !== null &&
		(value as RangeTemplate<T>)?.__templateType === "range"
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
	expression: string;
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

	const output: RangeTemplate<T> = value as unknown as RangeTemplate<T>;

	output.__templateType = "range";
	output.__data = {
		body: options.body,
		expression: options.expression,
	};

	return output;
};

export const deserialize = <T extends TemplateInput>(
	coder: Coder,
	value: RangeTemplate<T>
) => {
	const { body, expression } = value.__data;

	coder.line(`{{- range ${expression} }}`);

	render(body, coder);

	coder.line("{{- end }}");
};
