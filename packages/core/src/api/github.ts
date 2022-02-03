import https from "https";
import yaml from "js-yaml";

import log from "../util/log";
import { CustomResourceDefinition, isCRD } from "../util/crd";

const DOC_ROOT = "https://doc.crds.dev/raw";

export const get = (path: string) =>
	new Promise<Array<CustomResourceDefinition>>((resolve, reject) => {
		const url = `${DOC_ROOT}/${path}`;

		log.debug({ status: "fetching", method: "get", url });

		const request = https.get(url, (response) => {
			let data = "";

			response.on("data", (chunk) => {
				data += String(chunk);
			});

			response.on("end", () => {
				log.debug({ status: "fetched", method: "get", url });

				const value = yaml.loadAll(data);

				const crds = value.filter(isCRD);

				resolve(crds);
			});

			response.on("error", (error) => {
				reject(error);
			});
		});

		request.on("error", (error) => {
			reject(error);
		});
	});
