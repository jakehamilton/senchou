#! /usr/bin/env bash
set -euo pipefail

version=${1:-}

if [ -z ${version} ]; then
  echo "[fatal] This script must be called with a version name."
  echo ""
  echo "Example: ./fetch-k8s-json-schema.json 1.20.0"
  exit 1
fi

pushd $(dirname $0) &>/dev/null
  toolsdir=$(pwd)
popd &>/dev/null

schemasdir=$toolsdir/../schemas
target=$schemasdir/${version}

if [[ -f "${target}/_definitions.json" ]]; then
	echo "Schema for version \"${version}\" already exists."
	exit 0
else
	echo "Fetching schema for version \"${version}\"."
fi

pushd $schemasdir &>/dev/null
  mkdir -p $target
  pushd $target &>/dev/null
    openapi2jsonschema --kubernetes https://raw.githubusercontent.com/kubernetes/kubernetes/v${version}/api/openapi-spec/swagger.json -o .
    ls | grep -v _definitions.json | xargs rm
  popd &>/dev/null
popd &>/dev/null
