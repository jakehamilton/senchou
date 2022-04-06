import Coder from "@littlethings/coder";
import { render, template, TemplatedValue, TemplateInput } from ".";

export type ElseIfData<T> = {
	condition: string;
	body: T;
	else?: ElseIfTemplate<T> | T; // @TODO(jakehamilton): add ElseIfTemplate.
};

export type ElseIfTemplate<T> = {
	__templateType: "else";
	__data: ElseIfData<T>;
};

export const isElseIfTemplate = <T>(value: any): value is ElseIfTemplate<T> => {
	return (
		value !== null &&
		(value as ElseIfTemplate<T>)?.__templateType === "else"
	);
};

type SerializeOptions<T> = {
	// prettier-ignore
	condition: string;
	body: T;
	else?: ElseIfTemplate<T> | T;
};

export const serialize = <T>(
	options: SerializeOptions<T>
): ElseIfTemplate<T> => {
	let value;

	const output: ElseIfTemplate<T> = value as unknown as ElseIfTemplate<T>;

	output.__templateType = "else";
	output.__data = {
		condition: options.condition,
		body: options.body,
		else: options.else,
	};

	return output;
};

export const deserialize = <T>(coder: Coder, value: ElseIfTemplate<T>) => {};
