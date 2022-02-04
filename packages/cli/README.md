# @senchou/cli

> Generate TypeScript for Kubernetes resources.

## Installation

```shell
# Using npm.
npm install --global @senchou/cli

# Using yarn.
yarn add --global @senchou/cli

# Or run directly with npx.
npx @senchou/cli
```

## Usage

```shell
# Print the help message.
senchou --help
```

```
DESCRIPTION

    Manage Kubernetes manifests with TypeScript.

USAGE

    $ senchou <command> [options]

COMMANDS

    k8s                       Import types for a Kubernetes release
    crd                       Import types for a CustomResourceDefinition

OPTIONS

    --help, -h                Show this help message
    --verbose, -v             Set logging verbosity

EXAMPLE

    $ # Get help for commands.
    $ senchou k8s --help
    $ senchou crd --help

    $ # Run Senchou with verbose logging.
    $ senchou -v
    $ senchou -vv
    $ senchou -vvv

    $ # Run Senchou with no logging.
    $ LOG_LEVEL=SILENT senchou

    $ # Run Senchou with timestamps.
    $ LOG_TIMESTAMP=TRUE senchou

    $ # Filter logs from Senchou (based on log prefix).
    $ DEBUG="^some-regex$" senchou
```

## Before You Start

Senchou makes use of a few other projects to implement
its functionality. Here are the libraries that Senchou
makes use of under the hood.

-   [@littlethings/log](https://npm.im/@littlethings/log)
-   [@littlethings/coder](https://npm.im/@littlethings/coder)
-   [@littlethings/schemer](https://npm.im/@littlethings/schemer)

Of particular note is `@littlethings/log` which can be configured
with environment variables like `DEBUG` to modify how Senchou logs
things.

## Generate Kubernetes Types

Senchou can generate types for a given Kubernetes release.

```shell
# For help with the `k8s` command.
senchou k8s --help
```

```
DESCRIPTION

    Import types for a Kubernetes release.

USAGE

    $ senchou k8s [version]

OPTIONS

    --help, -h                Show this help message
    --output, -o              Set the output directory (default: ./senchou)
    --force, -f               Remove any conflicting files before writing

EXAMPLE

    $ # Import the default Kubernetes release's types.
    $ senchou k8s

    $ # Import a specific Kubernetes release's types.
    $ senchou k8s 1.20.0

    $ # Import to a custom directory.
    $ senchou k8s --output ./my-code

    $ # Overwrite an existing "k8s.ts" file.
    $ senchou k8s --force
```

## Generate CustomResourceDefinition Types

Senchou can generate types for CRDs from supported
sources.

```shell
# For help with the `crd` command.
senchou crd --help
```

```
DESCRIPTION

    Import types for a CustomResourceDefinition.

USAGE

    $ senchou crd <protocol>:<specifier>

OPTIONS

    --help, -h                Show this help message
    --output, -o              Set the output directory (default: ./senchou)
    --force, -f               Remove any conflicting files before writing
    --name, -n                Set the name of the output file (appended with ".ts")

PROTOCOLS

    github

        CRDs can be imported from GitHub using the "github"
        protocol. To fetch from GitHub, you must supply an
        owner and repository name like the following.

        $ # github:owner/repo
        $ senchou crd github:traefik/traefik-helm-chart

        Tags can also be used to fetch CRDs from a specific
        release.

        $ # github:owner/repo@tag
        $ senchou crd github:traefik/traefik-helm-chart@v10.14.0

EXAMPLE

    $ # Import types for Traefik from GitHub.
    $ senchou crd github:traefik/traefik-helm-chart

    $ # Import a specific version's types.
    $ senchou crd github:traefik/traefik-helm-chart@v10.14.0

    $ # Import to a custom directory.
    $ senchou crd github:traefik/traefik-helm-chart --output ./my-code

    $ # Name the output file.
    $ senchou crd github:traefik/traefik-helm-chart --name traefik

    $ # Overwrite an existing file.
    $ senchou crd github:traefik/traefik-helm-chart --force
```

## Examples

### Kubernetes

In this example, we will generate types for a Kubernetes
release and use them to create a new `Deployment`.

First, let Senchou generate types for the release.

```shell
senchou k8s
```

Then, we can create a TypeScript file.

```ts
// my-deployment.ts
import { Deployment } from "./senchou/k8s";

const deployment = Deployment({
	metadata: {
		name: "my-deployment",
	},
	spec: {
		template: {
			spec: {
				containers: [
					{
						name: "my-container",
						image: "myimage",
					},
				],
			},
		},
	},
});
```

Tada! Kubernetes manifests can now be created with
full TypeScript support.

### CustomResourceDefinitions

In this example, we will generate types for CRDs from
GitHub. Specifically, we will be loading the types for
Traefik and creating an `IngressRoute` resource.

First, let Senchou generate types for the CRDs.

```shell
senchou crd github:traefik/traefik-helm-chart --name traefik
```

Then, we can create a TypeScript file.

```ts
// my-ingress-route.ts
import {
	IngressRoute,
	IngressRoutePropsSpecRoutesKind,
	IngressRoutePropsSpecRoutesServicesKind,
} from "./senchou/traefik";

const route = IngressRoute({
	metadata: {
		name: "my-route",
	},
	spec: {
		routes: [
			{
				kind: IngressRoutePropsSpecRoutesKind.Rule,
				match: "Host(`example.com`)",
				services: [
					{
						name: "my-service",
						kind: IngressRoutePropsSpecRoutesServicesKind.Service,
						port: 80,
					},
				],
			},
		],
	},
});
```

Tada! CRD manifests can now be created with
full TypeScript support.
