import {
	StringTemplate,
	serialize as serializeString,
	deserialize as deserializeString,
} from "./templates/string";

// export type NumberTemplate = number & { __type?: "number" };
// export type BooleanTemplate = boolean & { __type?: "boolean" };
// export type ArrayTemplate<T> = Array<T> & { __type?: "array" };
// export type ObjectTemplate<T> = T & { __type?: "object" };

export type { TemplatedValue } from "./templates";
export { template, render } from "./templates";

// prettier-ignore
// export type TemplatedValue<Input> =
// 	Input extends number
// 		? (number | NumberTemplate)
// 	: Input extends string
// 		? (string | StringTemplate)
// 	: Input extends boolean
// 		? (boolean | BooleanTemplate)
// 	: Input extends Array<infer Item>
// 		? (Array<Item> | ArrayTemplate<TemplatedValue<Item>>)
// 	: Input extends object
// 		? (Input | ObjectTemplate<{
// 			[Key in keyof Input]: TemplatedValue<Input[Key]>;
// 		}>)
// 	: never
// ;

// export const template = <Input, Output>(
// 	constructor: (input: Input) => Output,
// 	value: TemplatedValue<Input>
// ): TemplatedValue<Output> => {
// 	return constructor(
// 		value as unknown as Input
// 	) as unknown as TemplatedValue<Output>;
// };

// template.string = serializeString;

// const f = (x: { a: number; b: string; c: Array<{ d: boolean }> }) => {
// 	return x;
// };

// const x = template(f, {
// 	a: 4,
// 	b: "hi",
// 	c: [{ d: true }],
// });

// const y = template(f, {
// 	a: 4,
// 	b: template.string(".Values.heck"),
// 	c: [{ d: true }],
// });

// export {};
