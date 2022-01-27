import log from "../util/log";
import kubernetes, { isKubernetes } from "./kubernetes";

const generators = (input: any) => {
	if (isKubernetes(input)) {
		return kubernetes(input);
	} else {
		log.fatal("Unexpected input for code generation.");
	}
};

export default generators;
