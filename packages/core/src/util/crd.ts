export const CRD_KIND = "CustomResourceDefinition";

export interface CustomResourceDefinition {
	apiVersion?: string;
	kind?: string;
	items?: Array<CustomResourceDefinition>;
	metadata?: {
		name?: string;
	};
	spec?: {
		group?: string;
		names: {
			kind: string;
			[key: string]: any;
		};
		versions?: Array<{
			name: string;
			schema?: { openAPIV3Schema?: any };
			[key: string]: any;
		}>;
		version?: string;
		validation?: { openAPIV3Schema?: any };
		[key: string]: any;
	};
}

export const isCRD = (input: any): input is CustomResourceDefinition => {
	return (
		typeof input === "object" && input !== null && input.kind === CRD_KIND
	);
};
