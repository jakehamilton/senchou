import kleur from "kleur";

const help = () => {
	const message = `
${kleur.bold(`DESCRIPTION`)}

    Manage Kubernetes manifests with TypeScript.

${kleur.bold(`USAGE`)}

    ${kleur.dim(`$`)} ${kleur.bold(`senchou`)} <command> [options]

${kleur.bold(`COMMANDS`)}

    k8s                       Import types for a Kubernetes release
    crd                       Import types for a CustomResourceDefinition

${kleur.bold(`OPTIONS`)}

    --help, -h                Show this help message
    --verbose, -v             Set logging verbosity

${kleur.bold(`EXAMPLE`)}

    ${kleur.dim(`$ # Get help for commands.`)}
    ${kleur.dim(`$`)} ${kleur.bold(`senchou k8s`)} --help
    ${kleur.dim(`$`)} ${kleur.bold(`senchou crd`)} --help

    ${kleur.dim(`$ # Run Senchou with verbose logging.`)}
    ${kleur.dim(`$`)} ${kleur.bold(`senchou`)} -v
    ${kleur.dim(`$`)} ${kleur.bold(`senchou`)} -vv
    ${kleur.dim(`$`)} ${kleur.bold(`senchou`)} -vvv

    ${kleur.dim(`$ # Run Senchou with no logging.`)}
    ${kleur.dim(`$`)} LOG_LEVEL=SILENT ${kleur.bold(`senchou`)}

    ${kleur.dim(`$ # Run Senchou with timestamps.`)}
    ${kleur.dim(`$`)} LOG_TIMESTAMP=TRUE ${kleur.bold(`senchou`)}

    ${kleur.dim(`$ # Filter logs from Senchou (based on log prefix).`)}
    ${kleur.dim(`$`)} DEBUG="^some-regex$" ${kleur.bold(`senchou`)}
`;

	console.log(message);
};

export default help;
