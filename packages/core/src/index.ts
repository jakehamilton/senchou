import crd from "./sources/crd";
import helm from "./sources/helm";
import github from "./sources/github";
import kubernetes from "./sources/kubernetes";

const core = {
	import: {
		helm: helm.import,
		github: github.import,
		kubernetes: kubernetes.import,
	},
	generate: {
		crd: crd.generate,
		kubernetes: kubernetes.generate,
	},
};

export default core;
