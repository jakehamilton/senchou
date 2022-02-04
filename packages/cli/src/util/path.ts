import path from "path";

export const resolveRelativePath = (relativePath: string) => {
	if (path.isAbsolute(relativePath)) {
		return relativePath;
	} else {
		return path.resolve(process.cwd(), relativePath);
	}
};
