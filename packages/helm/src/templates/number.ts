export type NumberData = {
	key: string;
};

export type NumberTemplate = number & {
	__templateType: "number";
	__data: NumberData;
};

export const isNumberTemplate = (value: any): value is NumberTemplate => {
	return (
		typeof value === "number" &&
		(value as NumberTemplate).__templateType === "number"
	);
};

export const serialize = (key: string): NumberTemplate => {
	const output = new Number() as NumberTemplate;

	output.__templateType = "number";
	output.__data = { key };

	return output;
};

export const deserialize = (value: number) => {
	if (isNumberTemplate(value)) {
		const { key } = value.__data;

		return `{{ ${key} }}`;
	} else {
		return JSON.stringify(value);
	}
};
