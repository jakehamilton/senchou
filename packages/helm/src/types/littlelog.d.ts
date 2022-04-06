declare module "@littlethings/log" {
	const littlelog: {
		info: (...messages: Array<any>) => void;
		debug: (...messages: Array<any>) => void;
		trace: (...messages: Array<any>) => void;
		warn: (...messages: Array<any>) => void;
		error: (...messages: Array<any>) => void;
		fatal: (...messages: Array<any>) => void;
		create: (name: string) => typeof littlelog;
		child: (name: string) => typeof littlelog;
	};
	export default littlelog;
}
