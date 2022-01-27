import path from "path";
import { Specifier } from "../../types/specifier";

export const isLocal = (
	specifier: string
): specifier is Specifier<typeof specifier> => {
	return specifier.startsWith(".") || path.isAbsolute(specifier);
};

const importer = <T extends string>(specifier: Specifier<T>) => {
	const resolvedPath = path.isAbsolute(specifier)
		? specifier
		: path.resolve(process.cwd(), specifier);

	// @TODO(jakehamilton): Load local yaml files as CRD.
};

export default importer;
