import Schemer from "@littlethings/schemer";
import emitApiObject from "../kubernetes/util/emit-api-object";

const CRD_KIND = "CustomResourceDefinition";

export interface CustomResourceDefinition {
	apiVersion?: string;
	kind?: string;
	items?: Array<CustomResourceDefinition>;
	metadata?: {
		name?: string;
	};
	spec?: {
		group?: string;
		names: {
			kind: string;
			[key: string]: any;
		};
		versions?: Array<{
			name: string;
			schema?: { openAPIV3Schema?: any };
			[key: string]: any;
		}>;
		version?: string;
		validation?: { openAPIV3Schema?: any };
		[key: string]: any;
	};
}

export const isCRD = (
	inputs: any
): inputs is Array<CustomResourceDefinition> => {
	return (
		Array.isArray(inputs) &&
		inputs.every((input) => input && input.kind === CRD_KIND)
	);
};

const generate = (crds: Array<CustomResourceDefinition>) => {
	const sorted = crds.sort((a, b) => {
		const nameA =
			`${a.spec?.group}/${a.spec?.names.kind}`.toLocaleLowerCase();
		const nameB =
			`${b.spec?.group}/${b.spec?.names.kind}`.toLocaleLowerCase();

		return nameA.localeCompare(nameB);
	});

	const schemer = new Schemer();

	for (const crd of sorted) {
		const version = crd.spec?.version ?? crd.spec?.versions?.[0];

		emitApiObject(
			{
				custom: true,
				fullName: crd.spec?.names.kind as string,
				group: crd.spec?.group as string,
				kind: crd.spec?.names.kind as string,
				version:
					typeof version === "string"
						? version
						: (version?.name as string),
				schema:
					typeof version === "string"
						? crd.spec?.validation?.openAPIV3Schema
						: version?.schema?.openAPIV3Schema ??
						  crd.spec?.validation?.openAPIV3Schema,
			},
			schemer
		);
	}

	return schemer.render();
};

export default generate;
