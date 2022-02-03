import { JSONSchema4 } from "json-schema";

/**
 * This property of an API Object definition holds useful
 * naming information about the object itself.
 *
 * @example
 * "x-kubernetes-group-version-kind": [
 * 	{
 * 			"group": "admissionregistration.k8s.io",
 * 			"kind": "MutatingWebhookConfiguration",
 * 			"version": "v1beta1"
 * 	}
 * ]
 */
export const X_KUBERNETES_GROUP_VERSION_KIND =
	"x-kubernetes-group-version-kind";

export interface GroupVersionKind {
	group: string;
	version: string;
	kind: string;
}

const getObjectName = (schema: JSONSchema4): GroupVersionKind | null => {
	const names = schema[
		X_KUBERNETES_GROUP_VERSION_KIND
	] as Array<GroupVersionKind>;

	// We only support API objects with the
	// x-kubernetes-group-version-kind property.
	if (!names) {
		return null;
	}

	const [name] = names;

	// There must be one entry in this array for us to use.
	if (!name) {
		return null;
	}

	// API objects have to have a `metadata` property
	// to be usable in manifests. Ones without it don't need
	// to be generated.
	if (!schema.properties?.metadata) {
		return null;
	}

	return name;
};

export default getObjectName;
