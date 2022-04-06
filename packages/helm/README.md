# @senchou/helm

> Generate Helm templates with TypeScript.

## Installation

```shell
# Using npm.
npm install @senchou/helm

# Using yarn.
yarn add @senchou/helm
```

## Usage

The `template` function lets you create a template for any
API Object or CustomResourceDefinition that you have generated
with Senchou. See the following example for some of the different
ways you can apply templating to resources.

```ts
import { template, Container, ContainerPort } from "@senchou/helm";
import { Pod } from "./senchou/k8s.ts";

const podTemplate = template(Pod, {
	metadata: {
		name: template.string(".Values.customName", {
			default: "default-name",
		}),
		labels: template.object<Record<string, string>>(".Values.customLabels"),
		annotations: template.object<Record<string, string>>(
			".Values.customAnnotations",
			{
				"my-permanent-annotation": "always-included",
			}
		),
	},
	spec: {
		containers: template.array<Container>(".Values.containers", [
			{
				name: "always-included",
				image: template.string(".Values.image", {
					default: "my-default-image:latest",
				}),
				ports: [
					{
						name: "https",
						containerPort: template.number(".Values.httpsPort"),
					},
					template.if<ContainerPort>({
						type: Object,
						condition: ".Values.enableGRPC",
						body: {
							name: "grpc",
							containerPort: 5000,
						},
						else: {
							name: "http",
							containerPort: 80,
						},
					}),
				],
			},
			template.if<Container>({
				type: Object,
				condition: ".Values.versionA",
				body: {
					name: "version-a",
					image: "version-a-image",
				},
				else: template.if<Container>({
					type: Object,
					condition: ".Values.versionB",
					body: {
						name: "version-b",
						image: "version-b-image",
					},
					else: {
						name: "version-c",
						image: "version-c-image",
					},
				}),
			}),
		]),
	},
});
```

After you've created your template, use the `render` function to
generate a Helm YAML template.

```ts
import { render } from "@senchou/helm";

render(podTemplate);
```

<details>
  <summary>View Output</summary>

```
apiVersion: v1
kind: Pod
metadata:
	annotations:
		my-permanent-annotation: always-included
		{{- with .Values.customAnnotations }}
		{{- toYaml . | nindent 4 }}
		{{- end }}
	labels:
		{{- with .Values.customLabels }}
		{{- toYaml . | nindent 4 }}
		{{- end }}
	name: {{ default "default-name" .Values.customName | quote }}
spec:
	containers:
		-
			name: always-included
			image: {{ default "my-default-image:latest" .Values.image | quote }}
			ports:
				-
					name: https
					containerPort: {{ .Values.httpsPort }}
				-
					{{- if .Values.enableGRPC }}
					name: grpc
					containerPort: 5000
					{{- else }}
					name: http
					containerPort: 80
					{{- end }}
		-
			{{- if .Values.versionA }}
			name: version-a
			image: version-a-image
			{{- else if .Values.versionB }}
			name: version-b
			image: version-b-image
			{{- else }}
			name: version-c
			image: version-c-image
			{{- end }}
		{{- toYaml .Values.containers | nindent 4 }}
```

</details>

## API

### `template(factory, templateValue)`

The `template` function takes in a factory function that produces
an API object or CustomResourceDefinition. This factory _must_ have been
created using Senchou in order to work with the templating system.

Second, the `template` function takes in a templated value. This can be
an object or array that you have used any of the various `template.*` helpers
on.

```ts
template(Pod, {
	metadata: {
		name: template.string(".Values.name"),
	},
});
```

### `template.string(key, options?)`

This helper returns a templated string. The `key` is the accessor
used in the generated YAML. Typically, this will select a value from
the user's supplied Helm values.

The `options` object allows you to customize the behavior of this helper.
You can specify a default value with `default` or disable quoting of the resulting
value by setting `quote` to `false`.

```ts
template(Pod, {
	metadata: {
		name: template.string(".Values.name", {
			default: "my-default-name",
		}),
		labels: {
			"some-label": template.string(".Values.some-label", {
				// This can be useful if you want to inject arbitrary
				// template expressions.
				quote: false,
			}),
		},
	},
});
```

### `template.number(key)`

This helper returns a templated number. The `key` is
a template expression to get the value of the number.

```ts
template(Pod, {
	spec: {
		containers: [
			{
				name: "my-container",
				image: "my-image",
				ports: [
					{
						containerPort: template.number(".Values.port"),
					},
				],
			},
		],
	},
});
```

### `template.boolean(key)`

This helper returns a templated boolean. The `key` is
a template expression to get the value of the boolean.

```ts
template(ConfigMap, {
	immutable: template.boolean(".Values.immutable"),
});
```

### `template.object<ObjectType>(key, value?: Partial<ObjectType>)`

This helper returns a templated object. The `key` is
a template expression to get the value of the object.

The value here can be highly dynamic, so it is typically required to
specify the type of `ObjectType` as that will be the return type of the
helper.

```ts
template(Pod, {
	metadata: {
		name: "my-pod",
		labels: template.object<Record<string, string>>(".Values.labels"),
		annotations: template.object<Record<string, string>>(
			".Values.annotations",
			{
				added: "always",
			}
		),
	},
});
```

### `template.array<ItemType>(key, items?: Array<ItemType>)`

This helper returns a templated array. The `key` is
a template expression to get the value of the array.

The items here can be highly dynamic, so it is typically required to
specify the type of `ItemType` as that will also correct the return type of the
helper.

```ts
template(Pod, {
	spec: {
		containers: template.array<Container>(".Values.containers", [
			{ name: "always-added-container", image: "some-image" },
		]),
	},
});
```

### `template.range<OutputType>(options)`

This helper is a bit more unique than the others. Similar to
`template.if`, it can output either an `Array` or and `Object`.
In order to know which type to generate, you will have to supply it
in the options.

```ts
template(Pod, {
	metadata: {
		name: "my-pod",
		labels: template.range<Record<string, string>>({
			type: Object,
			expression: "$key, $value := .Values.labels",
			body: {
				"{{ $key }}": template.string("$value"),
			},
		}),
	},
	spec: {
		containers: template.range<Array<Container>>({
			type: Array,
			expression: ".Values.containers",
			body: {
				name: template.string(".name"),
				image: template.string(".image"),
			},
		}),
	},
});
```

### `template.if<OutputType>(options)`

This helper can let you dynamically output objects or
arrays. However, you will need to specify the `OutputType`
due to its dynamic nature.

```ts
template(Pod, {
	metadata: {
		name: "my-pod",
		labels: template.if<Record<string, string>>({
			type: Object,
			condition: ".Values.enableLabels",
			body: {
				enabled: "yes",
			},
			else: {
				enabled: "false",
			},
		}),
	},
	spec: {
		containers: [
			{
				name: "my-container",
				image: "my-image",
				ports: template.if<Array<ContainerPort>>({
					type: Array,
					condition: ".Values.enableAllPorts",
					body: [
						{ containerPort: 80 },
						{ containerPort: 443 },
						{ containerPort: 22 },
					],
					else: template.if<Array<Container>>({
						type: Array,
						condition: ".Values.enableHTTP",
						body: [{ containerPort: 80 }],
						else: [],
					}),
				}),
			},
		],
	},
});
```

### `template.include<OutputType>(options)`

This helper will create an `include` directive in your
template. This makes it easy to drop in existing values
or fragments.

```ts
template(Pod, {
	spec: {
		affinity: template.include<Affinity>({
			type: Object,
			name: "my.affinity",
			context: ".",
		}),
	},
});
```

### `template.define(options)`

This helper will create a `define` directive in your
template. This can make it easy to reuse pieces of your
template with `include`.

```ts
template(
	Pod,
	template.define({
		type: Object,
		name: "my.pod",
		body: {
			metadata: {
				name: template.string(".Values.name"),
			},
		},
	})
);
```
