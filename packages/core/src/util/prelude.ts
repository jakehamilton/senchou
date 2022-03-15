import Coder from "@littlethings/coder";

const render = () => {
	const coder = new Coder();

	coder.openBlock("const senchou =");
	coder.openBlock("wrapTemplate: <T, U>(x: T, y: U): U =>");
	coder.line(
		"type MaybeTemplate = { __templateType?: string; __data?: object; };"
	);
	coder.line("const xTemplate = x as unknown as MaybeTemplate");
	coder.line("const yTemplate = y as unknown as MaybeTemplate");
	coder.openBlock("if (x && y && xTemplate.__templateType !== undefined)");
	coder.openBlock(`Object.defineProperty(yTemplate, "__templateType", `);
	coder.line("value: xTemplate.__templateType,");
	coder.line("enumerable: false,");
	coder.line("configurable: true,");
	coder.line("writable: true,");
	coder.closeBlock(");");
	coder.openBlock(`Object.defineProperty(yTemplate, "__data", `);
	coder.line("value: xTemplate.__data,");
	coder.line("enumerable: false,");
	coder.line("configurable: true,");
	coder.line("writable: true,");
	coder.closeBlock(");");
	// coder.line("yTemplate.__templateType = xTemplate.__templateType;");
	// coder.line("yTemplate.__data = xTemplate.__data;");
	coder.closeBlock();
	coder.line("return y");
	coder.closeBlock(",");
	coder.closeBlock(";");

	return coder.code;
};

export default render;
