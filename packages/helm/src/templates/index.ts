import {
	StringTemplate,
	serialize as serializeString,
	deserialize as deserializeString,
	isStringTemplate,
} from "./string";
import {
	NumberTemplate,
	serialize as serializeNumber,
	deserialize as deserializeNumber,
	isNumberTemplate,
} from "./number";
import {
	BooleanTemplate,
	serialize as serializeBoolean,
	deserialize as deserializeBoolean,
	isBooleanTemplate,
} from "./boolean";
import {
	ObjectTemplate,
	serialize as serializeObject,
	deserialize as deserializeObject,
	isObjectTemplate,
} from "./object";
import {
	ArrayTemplate,
	serialize as serializeArray,
	deserialize as deserializeArray,
	isArrayTemplate,
} from "./array";
import {
	IfTemplate,
	serialize as serializeIf,
	deserialize as deserializeIf,
	isIfTemplate,
} from "./if";
import {
	ElseIfTemplate,
	serialize as serializeElseIf,
	deserialize as deserializeElseIf,
	isElseIfTemplate,
} from "./elseif";
import {
	RangeTemplate,
	serialize as serializeRange,
	deserialize as deserializeRange,
	isRangeTemplate,
} from "./range";
import {
	DefineTemplate,
	serialize as serializeDefine,
	deserialize as deserializeDefine,
	isDefineTemplate,
} from "./define";
import {
	IncludeTemplate,
	serialize as serializeInclude,
	deserialize as deserializeInclude,
	isIncludeTemplate,
} from "./include";
import Coder from "@littlethings/coder";

export type BaseTemplateInput = object | string | number | boolean | null;
export type TemplateInput = BaseTemplateInput | Array<BaseTemplateInput>;

// prettier-ignore
export type TemplatedValue<Input> =
	Input extends number
		? (number | NumberTemplate)
	: Input extends string
		? (string | StringTemplate)
	: Input extends boolean
		? (boolean | BooleanTemplate)
	: Input extends Array<infer Item>
		? (Array<Item> | ArrayTemplate<Item>)
	: Input extends object
		? (Input | ObjectTemplate<Input>)
	: never
;

const template = <Input, Output>(
	constructor: (input: Input) => Output,
	value: TemplatedValue<Partial<Input>>
): TemplatedValue<Output> => {
	return constructor(
		value as unknown as Input
	) as unknown as TemplatedValue<Output>;
};

template.string = serializeString;
template.number = serializeNumber;
template.boolean = serializeBoolean;
template.object = serializeObject;
template.array = serializeArray;
template.if = serializeIf;
template.elseif = serializeElseIf;
template.range = serializeRange;
template.define = serializeDefine;
template.include = serializeInclude;

const isPrimitive = (
	input: any
): input is
	| number
	| string
	| boolean
	| null
	| NumberTemplate
	| StringTemplate
	| BooleanTemplate => {
	return (
		input === null ||
		typeof input === "number" ||
		typeof input === "string" ||
		typeof input === "boolean" ||
		isNumberTemplate(input) ||
		isStringTemplate(input) ||
		isBooleanTemplate(input)
	);
};

const renderPrimitive = (input: string | number | boolean | null) => {
	if (isStringTemplate(input)) {
		return deserializeString(input);
	} else if (isNumberTemplate(input)) {
		return deserializeNumber(input);
	} else if (isBooleanTemplate(input)) {
		return deserializeBoolean(input);
	} else {
		return input?.toString() ?? String(input);
	}
};

const render = (
	input: TemplateInput,
	coder: Coder = new Coder({
		indentChar: " ",
		indentAmount: 2,
	})
): string => {
	if (isPrimitive(input)) {
		return renderPrimitive(input);
	} else if (isRangeTemplate(input)) {
		// @ts-expect-error
		// @NOTE(jakehamilton): Types have gotten a bit difficult
		// to manage in here even though they should be fine in
		// practice. Might need to consider rearranging or
		// restructuring this piece.
		deserializeRange(coder, input);
	} else if (isDefineTemplate(input)) {
		// @ts-expect-error
		deserializeDefine(coder, input);
	} else if (isIncludeTemplate(input)) {
		deserializeInclude(coder, input);
	} else if (Array.isArray(input)) {
		if (isArrayTemplate(input)) {
			deserializeArray(coder, input);
		} else {
			for (const value of input) {
				if (isIfTemplate<any>(value)) {
					coder.line("-");

					coder.indent();
					deserializeIf(coder, value as IfTemplate<any>);
					coder.dedent();
				} else if (isPrimitive(value)) {
					coder.line(`- ${renderPrimitive(value)}`);
				} else if (Array.isArray(value)) {
					coder.line("-");

					coder.indent();
					render(value, coder);
					coder.dedent();
				} else if (typeof value === "object") {
					coder.line("-");

					coder.indent();
					render(value, coder);
					coder.dedent();
				}
			}
		}
	} else if (typeof input === "object") {
		if (isIfTemplate<any>(input)) {
			deserializeIf(coder, input as IfTemplate<any>);
		} else if (isObjectTemplate(input)) {
			deserializeObject(coder, input);
		} else {
			for (const [key, value] of Object.entries(input)) {
				if (isIfTemplate<any>(value)) {
					coder.line(`${key}:`);

					coder.indent();
					deserializeIf(coder, value);
					coder.dedent();
				} else if (isPrimitive(value)) {
					coder.line(`${key}: ${renderPrimitive(value)}`);
				} else if (Array.isArray(value)) {
					coder.line(`${key}:`);

					coder.indent();
					render(value, coder);
					coder.dedent();
				} else if (typeof value === "object") {
					coder.line(`${key}:`);

					coder.indent();
					render(value, coder);
					coder.dedent();
				}
			}
		}
	}

	return coder.code;
};

export { template, render };
