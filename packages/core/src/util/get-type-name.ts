import { pascal } from "@littlethings/schemer";

import { parseAPIName } from "./api-name";

const getTypeName = (fullName: string, isCustom = false): string => {
	const { kind, version } = parseAPIName(fullName);

	if (!version || isCustom || version.raw === "v1") {
		return kind;
	}

	return `${kind}${pascal(version.raw)}`;
};

export default getTypeName;
