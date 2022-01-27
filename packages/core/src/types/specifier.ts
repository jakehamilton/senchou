import { ErrorMessage } from "./error";

// prettier-ignore
export type Specifier<Str extends string> =
  Str extends `k8s@${infer Major}.${infer Minor}.${infer Patch}`
    ? Str
  : Str extends `k8s@`
    ? string & ErrorMessage<`Error parsing specifier, trailing "@" found in "${Str}".`>
  : Str extends `k8s`
    ? Str
  : Str extends `github:${infer Owner}/${infer Name}@${infer Major}.${infer Minor}.${infer Patch}`
    ? Str
  : Str extends `github:${infer Owner}/${infer Name}@${infer Major}.${infer Minor}`
    ? Str
  : Str extends `github:${infer Owner}/${infer Name}@`
    ? string & ErrorMessage<`Error parsing specifier, trailing "@" found in "${Str}".`>
  : Str extends `github:${infer Owner}/${infer Name}`
    ? Str
  : string;

const specifier = <T extends string>(value: Specifier<T>) => {
	return value;
};

const x = specifier("k8s");
