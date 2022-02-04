#!/usr/bin/env node

try {
	require("@senchou/cli");
} catch (error) {
	console.error(error);
	console.error(error.stack);
}
