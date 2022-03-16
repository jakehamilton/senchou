export type BooleanData = {
	key: string;
};

export type BooleanTemplate = boolean & {
	__templateType: "boolean";
	__data: BooleanData;
};

export const isBooleanTemplate = (value: any): value is BooleanTemplate => {
	return (
		value !== null &&
		typeof value === "object" &&
		value.constructor === Boolean &&
		(value as BooleanTemplate).__templateType === "boolean"
	);
};

export const serialize = (key: string): BooleanTemplate => {
	const output = new Boolean() as BooleanTemplate;

	Object.defineProperty(output, "__templateType", {
		value: "boolean",
		enumerable: false,
		configurable: true,
		writable: true,
	});

	Object.defineProperty(output, "__data", {
		value: { key },
		enumerable: false,
		configurable: true,
	});

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
