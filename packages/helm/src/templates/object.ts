import Coder from "@littlethings/coder";
import { render, TemplatedValue } from ".";

export type ObjectData<T> = {
	key: string;
	value?: Partial<T>;
};

export type ObjectTemplate<T> = {
	[Key in keyof T]: TemplatedValue<T[Key]>;
} & { __templateType: "object"; __data: ObjectData<T> };

export const isObjectTemplate = <T>(value: any): value is ObjectTemplate<T> => {
	return (
		value !== null &&
		typeof value === "object" &&
		!Array.isArray(value) &&
		(value as ObjectTemplate<T>).__templateType === "object"
	);
};

export const serialize = <
	T extends object,
	Props extends Partial<T> = Partial<T>
>(
	key: string,
	value?: Props
): ObjectTemplate<T> => {
	const output = ({ ...value } ?? {}) as ObjectTemplate<T>;

	Object.defineProperty(output, "__templateType", {
		value: "object",
		enumerable: false,
		configurable: true,
		writable: true,
	});

	Object.defineProperty(output, "__data", {
		value: { key, value },
		enumerable: false,
		configurable: true,
	});

	return output;
};

export const deserialize = <T>(coder: Coder, value: ObjectTemplate<T>) => {
	const { key, value: props } = value.__data;

	if (props) {
		render(props, coder);
	}

	coder.line(`{{- with ${key} }}`);
	coder.line(
		`{{- toYaml . | nindent ${coder.currentIndent * coder.indentAmount} }}`
	);
	coder.line("{{- end }}");
};
