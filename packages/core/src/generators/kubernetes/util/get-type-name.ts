import { toPascalCase } from "codemaker";

import { parseAPIName } from "./api-name";

const getTypeName = (fullName: string, isCustom = false): string => {
	console.log(fullName);
	const { kind, version } = parseAPIName(fullName);

	if (!version || isCustom || version.raw === "v1") {
		return kind;
	}

	return `${kind}${toPascalCase(version.raw)}`;
};

export default getTypeName;
