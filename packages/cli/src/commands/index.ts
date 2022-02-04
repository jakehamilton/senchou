import k8s from "./k8s";
import crd from "./crd";

const commands: Record<string, () => void | Promise<void>> = {
	k8s,
	crd,
};

export default commands;
