import https from "https";
import yaml from "js-yaml";
import log from "./log";

const DOC_ROOT = "https://doc.crds.dev/raw";

export const get = (path: string) =>
	new Promise<object | Array<unknown>>((resolve, reject) => {
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

				if (
					value === null ||
					(typeof value !== "object" && !Array.isArray(value))
				) {
					throw new Error(
						`Received type other than object or array from doc.crds.dev. Type "${
							value === null ? "null" : typeof value
						}" is not supported.`
					);
				}

				resolve(value);
			});

			response.on("error", (error) => {
				reject(error);
			});
		});

		request.on("error", (error) => {
			reject(error);
		});
	});
