import log from "../util/log";
import crd, { isCRD } from "./crd";
import kubernetes, { isKubernetes } from "./kubernetes";

const generators = (input: any) => {
	if (isKubernetes(input)) {
		return kubernetes(input);
	} else if (isCRD(input)) {
		return crd(input);
	} else {
		log.fatal("Unexpected input for code generation.");
	}
};

export default generators;
