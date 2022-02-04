import arg from "arg";
import littlelog from "@littlethings/log";

import rootArgs from "./args";

const args = arg(rootArgs, {
	permissive: true,
});

if (args["--verbose"]) {
	switch (args["--verbose"]) {
		default:
		case 0:
			break;
		case 1:
			littlelog.setVerbosity("INFO");
			break;
		case 2:
			littlelog.setVerbosity("DEBUG");
			break;
		case 3:
			littlelog.setVerbosity("TRACE");
			break;
	}

	if (args["--verbose"] > 3) {
		littlelog.setVerbosity("TRACE");
	}
} else if (!process.env.LOG_LEVEL) {
	// @FIXME(jakehamilton): The @littlethings/log package needs to be updated
	//  to default the verbosity level to "INFO".
	littlelog.setVerbosity("INFO");
}

export default littlelog.create("@senchou/cli");
