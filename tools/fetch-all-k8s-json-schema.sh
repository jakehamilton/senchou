#! /usr/bin/env bash
set -euo pipefail

GITHUB_TOKEN=${GITHUB_TOKEN:-}

if [[ -z ${GITHUB_TOKEN} ]]; then
	echo "You must set the GITHUB_TOKEN environment variable to avoid rate limiting."
fi

get_tags_json() {
	tags_json=$(curl -s "https://api.github.com/repos/kubernetes/kubernetes/tags?page=$1" \
		-H "Accept: application/vnd.github+json" \
		-H "Authorization: Bearer ${GITHUB_TOKEN}" \
		-H "X-GitHub-Api-Version: 2022-11-28" \
	)

	echo $tags_json
}

get_tag_names() {
	echo "${1}" | jq -r '.[].name | select(contains("rc") | not) | select(contains("alpha") | not) | select(contains("beta") | not)'
}

# Usage: lstrip "string" "pattern"
lstrip() {
	printf '%s\n' "${1##$2}"
}

pushd $(dirname $0) &>/dev/null
  toolsdir=$(pwd)
popd &>/dev/null

page="1"

while true; do
	tags_json=$(get_tags_json "${page}")
	tag_names=$(get_tag_names "${tags_json}")

	while IFS= read -r tag; do
		if [[ "${tag}" == "" ]]; then
			continue
		fi

		version="$(lstrip "${tag}" "v")"
		$toolsdir/fetch-k8s-json-schema.sh "${version}"
	done <<< "${tag_names}"

	if [[ "${tag_names}" == "" ]]; then
		break
	fi

	page=$((page + 1))
done
