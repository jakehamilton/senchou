import Schemer from "@littlethings/schemer";

import emitApiObject from "../util/emit-api-object";
import { CustomResourceDefinition } from "../util/crd";
import prelude from "../util/prelude";

const source = {
	generate: (
		crd: CustomResourceDefinition | Array<CustomResourceDefinition>
	) => {
		const crds = Array.isArray(crd) ? crd : [crd];

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

		return prelude() + schemer.render();
	},
};

export default source;
