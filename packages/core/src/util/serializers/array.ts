import { Type } from "@littlethings/schemer";

const serializer = (type: Type) => (identifier: string) => {
	return `prelude.serialize(${identifier}, items => senchou.wrapTemplate(items, items.map(item => ${type.serialize(
		"item"
	)}).filter(prelude.isNotUndefined)))`;
};

export default serializer;
