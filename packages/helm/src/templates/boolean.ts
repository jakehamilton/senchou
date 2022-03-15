export type BooleanData = {
	key: string;
};

export type BooleanTemplate = boolean & {
	__templateType: "boolean";
	__data: BooleanData;
};

export const isBooleanTemplate = (value: any): value is BooleanTemplate => {
	return (
		typeof value === "boolean" &&
		(value as BooleanTemplate).__templateType === "boolean"
	);
};

export const serialize = (key: string): BooleanTemplate => {
	const output = new Boolean() as BooleanTemplate;

	output.__templateType = "boolean";
	output.__data = { key };

	return output;
};

export const deserialize = (value: boolean) => {
	if (isBooleanTemplate(value)) {
		const { key } = value.__data;

		return `{{ ${key} }}`;
	} else {
		return JSON.stringify(value);
	}
};
