import kleur from "kleur";

const help = () => {
	// prettier-ignore
	const message = `
${kleur.bold(`DESCRIPTION`)}

    Import types for a CustomResourceDefinition.

${kleur.bold(`USAGE`)}

    ${kleur.dim(`$`)} ${kleur.bold(`senchou crd <protocol>:<specifier>`)}

${kleur.bold(`OPTIONS`)}

    --help, -h                Show this help message
    --output, -o              Set the output directory (default: ./senchou)
    --force, -f               Remove any conflicting files before writing
    --name, -n                Set the name of the output file (appended with ".ts")

${kleur.bold(`PROTOCOLS`)}

    ${kleur.bold("github")}

        CRDs can be imported from GitHub using the "github"
        protocol. To fetch from GitHub, you must supply an
        owner and repository name like the following.

        ${kleur.dim(`$ # github:owner/repo`)}
        ${kleur.dim(`$`)} ${kleur.bold(`senchou crd github:traefik/traefik-helm-chart`)}

        Tags can also be used to fetch CRDs from a specific
        release.

        ${kleur.dim(`$ # github:owner/repo@tag`)}
        ${kleur.dim(`$`)} ${kleur.bold(`senchou crd github:traefik/traefik-helm-chart@v10.14.0`)}

${kleur.bold(`EXAMPLE`)}

    ${kleur.dim(`$ # Import types for Traefik from GitHub.`)}
    ${kleur.dim(`$`)} ${kleur.bold(`senchou crd`)} github:traefik/traefik-helm-chart

    ${kleur.dim(`$ # Import a specific version's types.`)}
    ${kleur.dim(`$`)} ${kleur.bold(`senchou crd`)} github:traefik/traefik-helm-chart@v10.14.0

    ${kleur.dim(`$ # Import to a custom directory.`)}
    ${kleur.dim(`$`)} ${kleur.bold(`senchou crd`)} github:traefik/traefik-helm-chart --output ./my-code

    ${kleur.dim(`$ # Name the output file.`)}
    ${kleur.dim(`$`)} ${kleur.bold(`senchou crd`)} github:traefik/traefik-helm-chart --name traefik

    ${kleur.dim(`$ # Overwrite an existing file.`)}
    ${kleur.dim(`$`)} ${kleur.bold(`senchou crd`)} github:traefik/traefik-helm-chart --force
`;

	console.log(message);
};

export default help;
