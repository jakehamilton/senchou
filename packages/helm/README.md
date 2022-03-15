# @senchou/core

> Generate TypeScript for Kubernetes resources.

## Installation

```shell
# Using npm.
npm install @senchou/core

# Using yarn.
yarn add @senchou/core
```

## Usage

### Import

Imports fetch manifests from sources, returning
a JSON Schema, CustomResourceDefinitions, or
JSON-formatted manifests.

#### Kubernetes

To import a Kubernetes release's schema, see the
following example.

```ts
import core from "@senchou/core";

const schema = await core.import.kubernetes();
```

To import a specific release, specify the version
number.

```ts
import core from "@senchou/core";

const schema = await core.import.kubernetes("1.20.0");
```

#### CustomResourceDefinition

CustomResourceDefinitions can be imported from supported
sources.

##### GitHub

Importing CustomResourceDefinitions from GitHub is supported
via [doc.crds.dev](https://doc.crds.dev). To import CRDs from
GitHub, see the following example.

```ts
import core from "@senchou/core";

const crds = await core.import.github("traefik/traefik-helm-chart");
```

##### Helm

[Helm](https://helm.sh) Charts can be imported if Helm is installed.
See the following example.

```ts
import core from "@senchou/core";

const manifests = await core.import.helm({
	name: "my-traefik-deployment",
	chart: "traefik/traefik",
});
```

To supply custom values for a chart, see the following
example.

```ts
import core from "@senchou/core";

const manifests = await core.import.helm({
	name: "my-traefik-deployment",
	chart: "traefik/traefik",
	values: {
		// Any values for your chart can be set here.
		ingressRoute: {
			dashboard: {
				enabled: false,
			},
		},
	},
});
```

Custom arguments can be passed to the Helm command
line if extra customization is necessary.

```ts
import core from "@senchou/core";

const manifests = await core.import.helm({
	name: "my-traefik-deployment",
	chart: "traefik/traefik",
	args: ["--my-arg", "--my-other-arg"],
});
```

### Generate

TypeScript code can be generated from imported
Kubernetes JSON Schemas or CustomResourceDefinitions.

#### Kubernetes

To generate types for a Kubernetes release, see the
following example.

```ts
import core from "@senchou/core";

const schema = await core.import.kubernetes();

const code = core.generate.kubernetes(schema);
```

#### CustomResourceDefinitions

To generate types for CustomResourceDefinitions, see
the following example.

```ts
import core from "@senchou/core";

// CRDs from any source can be used.
const crds = await core.import.github("traefik/traefik-helm-chart");

const code = core.generate.crd(crds);
```

### Utility

A helper and type exists to assert that an object is
a `CustomResourceDefinition`.

```ts
import { isCRD, CustomResourceDefinition } from "@senchou/core";

const invalid = {};

isCRD(invalid); // false

const valid = {
	kind: "CustomResourceDefinition",
};

if (isCRD(valid)) {
	// valid is CustomResourceDefinition
}

const crd: CustomResourceDefinition = {
	/* ... */
};
```
