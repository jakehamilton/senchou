import Coder from "@littlethings/coder";
import { render, TemplatedValue } from ".";

export type ArrayData<T> = {
	key: string;
	items?: Array<T>;
};

export type ArrayTemplate<T> = Array<TemplatedValue<T>> & {
	__templateType: "array";
	__data: ArrayData<T>;
};

export const isArrayTemplate = <T>(value: any): value is ArrayTemplate<T> => {
	return (
		value !== null &&
		Array.isArray(value) &&
		(value as ArrayTemplate<T>).__templateType === "array"
	);
};

export const serialize = <T>(
	key: string,
	items?: Array<T>
): ArrayTemplate<T> => {
	const output = [...(items ?? [])] as unknown as ArrayTemplate<T>;

	Object.defineProperty(output, "__templateType", {
		value: "array",
		enumerable: false,
		configurable: true,
		writable: true,
	});

	Object.defineProperty(output, "__data", {
		value: { key, items },
		enumerable: false,
		configurable: true,
	});

	return output;
};

export const deserialize = <T>(coder: Coder, value: ArrayTemplate<T>) => {
	const { key, items } = value.__data;

	if (items) {
		render(items, coder);
	}
	coder.line(
		`{{- toYaml ${key} | nindent ${
			coder.currentIndent * coder.indentAmount
		} }}`
	);
};
