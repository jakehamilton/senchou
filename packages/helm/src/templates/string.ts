export type StringData = {
	key: string;
	options: SerializeOptions;
};

export type StringTemplate = string & {
	__templateType: "string";
	__data: StringData;
};

export const isStringTemplate = (value: any): value is StringTemplate => {
	return (
		typeof value === "object" &&
		value.constructor === String &&
		(value as StringTemplate).__templateType === "string"
	);
};

type SerializeOptions = {
	default?: string;
	quote?: boolean;
};

export const serialize = (
	key: string,
	options: SerializeOptions = {}
): StringTemplate => {
	const output = new String(key) as unknown as StringTemplate;

	output.__templateType = "string";
	output.__data = { key, options };

	return output;
};

export const deserialize = (value: string) => {
	if (isStringTemplate(value)) {
		const { key, options } = value.__data;

		let expression;

		if (options.default !== undefined) {
			expression = `default "${options.default}" ${key}`;
		} else {
			expression = `${key}`;
		}

		let filters = [];

		if (options.quote !== false) {
			filters.push("quote");
		}

		const filterText =
			filters.length > 0 ? ` | ${filters.join(" | ")}` : "";

		return `{{ ${expression}${filterText} }}`;
	} else {
		return JSON.stringify(value);
	}
};
