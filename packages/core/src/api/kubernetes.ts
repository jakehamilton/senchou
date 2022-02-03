import https from "https";
import { JSONSchema4 } from "json-schema";
import log from "../util/log";

const getURL = (version: string) => {
	return `https://raw.githubusercontent.com/jakehamilton/senchou/main/schemas/${version}/_definitions.json`;
};

export const get = (version: string) =>
	new Promise<JSONSchema4>((resolve, reject) => {
		const url = getURL(version);

		log.debug({ status: "fetching", method: "get", url });

		const request = https.get(url, (response) => {
			let data = "";

			response.on("data", (chunk) => {
				data += String(chunk);
			});

			response.on("end", () => {
				log.debug({ status: "fetched", method: "get", url });

				const value = JSON.parse(data);

				if (
					value === null ||
					typeof value !== "object" ||
					Array.isArray(value)
				) {
					throw new Error(
						`Received type other than object. Type "${
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
