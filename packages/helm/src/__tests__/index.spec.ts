import { describe, it, expect } from "vitest";
import { render, template } from "..";
import { Affinity, Container, ContainerPort, Pod } from "./util/k8s";

describe("Helm", () => {
	it("should work", () => {
		const podTemplate = template(Pod, {
			metadata: {
				name: template.string(".Values.name"),
				labels: template.object<Record<string, string>>(
					".Values.labels",
					{
						default: "this label will always be applied",
					}
				),
			},
			spec: {
				hostNetwork: template.boolean(".Values.hostNetwork"),
				containers: template.array<Container>(".Values.containers", [
					{
						name: "always-included-container",
						image: "nginx",
						ports: [
							{
								containerPort: template.number(
									".Values.containerPort"
								),
							},
						],
					},
				]),
			},
		});

		expect(JSON.stringify(podTemplate, null, 2)).toMatchInlineSnapshot(`
			"{
			  \\"apiVersion\\": \\"v1\\",
			  \\"kind\\": \\"Pod\\",
			  \\"metadata\\": {
			    \\"labels\\": {
			      \\"default\\": \\"this label will always be applied\\"
			    },
			    \\"name\\": \\".Values.name\\"
			  },
			  \\"spec\\": {
			    \\"containers\\": [
			      {
			        \\"image\\": \\"nginx\\",
			        \\"name\\": \\"always-included-container\\",
			        \\"ports\\": [
			          {
			            \\"containerPort\\": 0
			          }
			        ]
			      }
			    ],
			    \\"hostNetwork\\": false
			  }
			}"
		`);

		const manifest = render(podTemplate);

		expect(manifest).toMatchInlineSnapshot(`
			"apiVersion: v1
			kind: Pod
			metadata:
			  labels:
			    default: this label will always be applied
			    {{- with .Values.labels }}
			    {{- toYaml . | nindent 4 }}
			    {{- end }}
			  name: {{ .Values.name | quote }}
			spec:
			  containers:
			    -
			      name: always-included-container
			      image: nginx
			      ports:
			        -
			          containerPort: {{ .Values.containerPort }}
			    {{- toYaml .Values.containers | nindent 4 }}
			  hostNetwork: {{ .Values.hostNetwork }}
			"
		`);
	});

	it("should template objects", () => {
		const podTemplate = template(Pod, {
			metadata: {
				name: template.string(".Values.name"),
				labels: template.object<Record<string, string>>(
					".Values.labels",
					{
						"x-generated-by": "senchou",
					}
				),
			},
			spec: {
				containers: [
					{
						name: "{{ .Values.name }}-container",
						image: template.string(".Values.image"),
					},
				],
			},
		});

		const manifest = render(podTemplate);

		expect(manifest).toMatchInlineSnapshot(`
			"apiVersion: v1
			kind: Pod
			metadata:
			  labels:
			    x-generated-by: senchou
			    {{- with .Values.labels }}
			    {{- toYaml . | nindent 4 }}
			    {{- end }}
			  name: {{ .Values.name | quote }}
			spec:
			  containers:
			    -
			      image: {{ .Values.image | quote }}
			      name: {{ .Values.name }}-container
			"
		`);
	});

	it("supports conditionals", () => {
		const podTemplate = template(Pod, {
			metadata: {
				labels: template.if<Record<string, string>>({
					type: Object,
					condition: ".Values.first",
					body: template.object(".Values.configA", {
						"x-name": "If",
						embedded: "true",
						"x-string": template.string(".Values.string"),
						"x-unquoted-string": template.string(".Values.string", {
							quote: false,
						}),
						"x-default-string": template.string(".Values.string", {
							default: "My Default",
						}),
					}),
					else: template.if({
						type: Object,
						condition: ".Values.second",
						body: template.if<Record<string, string>>({
							type: Object,
							condition: ".Values.third",
							body: {
								"x-name": "If Else If If",
							},
							else: {
								"x-name": "If Else Else",
							},
						}),
						else: {
							"x-name": "If Else",
						},
					}),
				}),
			},
			spec: {
				containers: template.if<Array<Container>>({
					type: Array,
					condition: ".Values.something",
					body: [
						{
							name: "my-container",
						},
						template.if({
							type: Object,
							condition: ".Values.first",
							body: {
								name: "my-awesome-container",
							},
						}),
					],
				}),
			},
		});

		const manifest = render(podTemplate);

		expect(manifest).toMatchInlineSnapshot(`
			"apiVersion: v1
			kind: Pod
			metadata:
			  labels:
			    {{- if .Values.first }}
			    x-name: If
			    embedded: true
			    x-string: {{ .Values.string | quote }}
			    x-unquoted-string: {{ .Values.string }}
			    x-default-string: {{ default \\"My Default\\" .Values.string | quote }}
			    {{- with .Values.configA }}
			    {{- toYaml . | nindent 4 }}
			    {{- end }}
			    {{- else if .Values.second }}
			    {{- if .Values.third }}
			    x-name: If Else If If
			    {{- else }}
			    x-name: If Else Else
			    {{- end }}
			    {{- else }}
			    x-name: If Else
			    {{- end }}
			spec:
			  containers:
			    {{- if .Values.something }}
			    -
			      name: my-container
			    -
			      {{- if .Values.first }}
			      name: my-awesome-container
			      {{- end }}
			    {{- end }}
			"
		`);
	});

	it("supports ranges", () => {
		const podTemplate = template(Pod, {
			spec: {
				containers: template.range<Array<Container>>({
					type: Array,
					expression: ".Values.containers",
					body: [
						{
							name: template.string(".name"),
							image: template.string(".image"),
						},
					],
				}),
			},
		});

		const manifest = render(podTemplate);

		expect(manifest).toMatchInlineSnapshot(`
			"apiVersion: v1
			kind: Pod
			spec:
			  containers:
			    {{- range .Values.containers }}
			    -
			      name: {{ .name | quote }}
			      image: {{ .image | quote }}
			    {{- end }}
			"
		`);
	});

	it("supports define", () => {
		const podTemplate = template(
			Pod,
			template.define({
				type: Object,
				name: "my.pod",
				body: {
					metadata: {
						name: template.string(".Values.name"),
					},
					spec: {
						containers: [
							{
								name: template.string(".Values.name"),
								image: "some-image",
							},
						],
					},
				},
			})
		);

		const manifest = render(podTemplate);

		expect(manifest).toMatchInlineSnapshot(`
			"{{- define \\"my.pod\\" }}
			metadata:
			  name: {{ .Values.name | quote }}
			spec:
			  containers:
			    -
			      name: {{ .Values.name | quote }}
			      image: some-image
			{{- end }}
			"
		`);
	});

	it("supports include", () => {
		const podTemplate = template(Pod, {
			spec: {
				affinity: template.include<Affinity>({
					type: Object,
					name: "my.affinity",
					context: ".",
				}),
				containers: [
					template.include<Container>({
						type: Object,
						name: "my.container",
					}),
					{
						name: "other-container",
						ports: template.include<Array<ContainerPort>>({
							type: Array,
							name: "my.other.ports",
						}),
					},
				],
			},
		});

		const manifest = render(podTemplate);

		expect(manifest).toMatchInlineSnapshot(`
			"apiVersion: v1
			kind: Pod
			spec:
			  affinity:
			    {{- include \\"my.affinity\\" . | nindent 4 }}
			  containers:
			    -
			      {{- include \\"my.container\\" | nindent 6 }}
			    -
			      name: other-container
			      ports:
			        {{- include \\"my.other.ports\\" | nindent 8 }}
			"
		`);
	});

	it("supports the basic demo", () => {
		const podTemplate = template(Pod, {
			metadata: {
				name: template.string(".Values.customName", {
					default: "default-name",
				}),
				labels: template.object<Record<string, string>>(
					".Values.customLabels"
				),
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
								containerPort:
									template.number(".Values.httpsPort"),
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

		const manifest = render(podTemplate);

		expect(manifest).toMatchInlineSnapshot(`
			"apiVersion: v1
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
			  name: {{ default \\"default-name\\" .Values.customName | quote }}
			spec:
			  containers:
			    -
			      name: always-included
			      image: {{ default \\"my-default-image:latest\\" .Values.image | quote }}
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
			"
		`);
	});
});
