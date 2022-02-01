import fs from "fs";
import path from "path";
import Schemer from "@littlethings/schemer";
import importer from "./importers";
import generator from "./generators";

const main = async () => {
	const doc = await importer(process.argv[2]);
	const result = generator(doc);
	// console.log(result);
	fs.writeFileSync(path.resolve(__dirname, "k8s.ts"), result ?? "");
};

main();

// const core = {
// 	import: importer,
// 	generate: generator,
// };

// export default core;
