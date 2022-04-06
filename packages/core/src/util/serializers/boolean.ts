const serialize = (identifier: string) => {
	return `prelude.serialize(${identifier}, value => senchou.wrapTemplate(value, value))`;
};

export default serialize;
