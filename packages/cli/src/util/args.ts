import arg from "arg";

const rootArgs = {
	"--help": Boolean,
	"-h": "--help",

	"--verbose": arg.COUNT,
	"-v": "--verbose",
};

export default rootArgs;
