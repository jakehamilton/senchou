{
  description = "A very basic flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/21.11";

    utils.url = "github:gytis-ivaskevicius/flake-utils-plus";
  };

  outputs = inputs@{ self, utils, ... }:
    utils.lib.mkFlake {
      inherit self inputs;

      outputsBuilder = channels:
        let
          pkgs = channels.nixpkgs;
          inherit (pkgs)
            lib python39 python39Packages gnugrep findutils nodejs-17_x helm
            kubectl;
          inherit (python39Packages) buildPythonPackage fetchPypi;

          # A dependency of `openapi2jsonschema`
          click = python39Packages.click.overrideAttrs (oldAttrs: rec {
            pname = "click";
            version = "7.2.1";

            src = fetchPypi {
              inherit pname version;
              sha256 = "06kbzd6sjfkqan3miwj9wqyddfxc2b6hi7p5s4dvqjb3gif2bdfj";
            };
          });

          # This package isn't available in NixPkgs yet
          openapi2jsonschema = buildPythonPackage rec {
            pname = "openapi2jsonschema";
            version = "0.9.1";

            format = "pyproject";

            src = fetchPypi {
              inherit pname version;
              sha256 = "049q3z63anjn6vzgshbfnzcf9pb6y942vabq938zvi3fnm8lips9";
            };

            propagatedBuildInputs = with python39Packages;
              (builtins.trace (pyyaml.version)) [
                poetry
                colorama
                pyyaml
                jsonref
                click
              ];

            meta = with lib; {
              description =
                "A utility to extract JSON Schema from a valid OpenAPI specification.";

              homepage = "https://github.com/garethr/openapi2jsonschema";

              license = licenses.asl20;

              maintainer = [ ];
            };
          };
        in {
          devShell = pkgs.mkShell {
            buildInputs = [
              python39
              openapi2jsonschema
              gnugrep
              findutils
              nodejs-17_x
              helm
              kubectl
            ];
          };
        };
    };
}
