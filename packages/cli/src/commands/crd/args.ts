import arg from "arg";
import rootArgs from "../../util/args";

const getArgs = () => {
	return arg({
		...rootArgs,

		"--output": String,
		"-o": "--output",

		"--force": Boolean,
		"-f": "--force",

		"--name": String,
		"-n": "--name",
	});
};

export default getArgs;
