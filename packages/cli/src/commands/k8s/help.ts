import kleur from "kleur";

const help = () => {
	const message = `
${kleur.bold(`DESCRIPTION`)}

    Import types for a Kubernetes release.

${kleur.bold(`USAGE`)}

    ${kleur.dim(`$`)} ${kleur.bold(`senchou k8s [version]`)}

${kleur.bold(`OPTIONS`)}

    --help, -h                Show this help message
    --output, -o              Set the output directory (default: ./senchou)
    --force, -f               Remove any conflicting files before writing

${kleur.bold(`EXAMPLE`)}

    ${kleur.dim(`$ # Import the default Kubernetes release's types.`)}
    ${kleur.dim(`$`)} ${kleur.bold(`senchou k8s`)}

    ${kleur.dim(`$ # Import a specific Kubernetes release's types.`)}
    ${kleur.dim(`$`)} ${kleur.bold(`senchou k8s`)} 1.20.0

    ${kleur.dim(`$ # Import to a custom directory.`)}
    ${kleur.dim(`$`)} ${kleur.bold(`senchou k8s`)} --output ./my-code

    ${kleur.dim(`$ # Overwrite an existing "k8s.ts" file.`)}
    ${kleur.dim(`$`)} ${kleur.bold(`senchou k8s`)} --force
`;

	console.log(message);
};

export default help;
