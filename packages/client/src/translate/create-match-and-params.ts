import {
    ArgumentNode,
    DirectiveNode,
    FieldNode,
    StringValueNode,
    valueFromASTUntyped,
} from "graphql";
import createWhereAndParams from "./create-where-and-params";
import createSortAndParams from "./create-sort-and-params";
import { Direction } from "../types";
import createSkipLimitStr from "./create-skip-limit-str";

function createMatchProjectionAndParams({
    varName,
    projectField,
    chainStr,
    variables,
}: {
    varName: string;
    projectField: FieldNode;
    chainStr?: string;
    variables: Record<string, unknown>;
}): [string, any] {
    interface Res {
        strs: string[];
        params: any;
    }

    function reducer(res: Res, value: FieldNode): Res {
        const key = value.name.value;
        let param: string;

        if (chainStr) {
            param = `${chainStr}_${key}`;
        } else {
            param = `${varName}_${key}`;
        }

        const selections = (value.selectionSet?.selections ||
            []) as FieldNode[];

        const cypherDirective = value.directives?.find(
            (x) => x.name.value === "cypher"
        );

        const nodeDirective = value.directives?.find(
            (x) => x.name.value === "node"
        );

        const edgeDirective = value.directives?.find(
            (x) => x.name.value === "edge"
        );

        const paginateDirective = value.directives?.find(
            (x) => x.name.value === "paginate"
        );

        const skipLimit = createSkipLimitStr({
            paginateDirective,
            variables,
        });

        if (cypherDirective) {
            const statementArg = cypherDirective.arguments?.find(
                (x) => x.name.value === "statement"
            ) as ArgumentNode;
            const argumentsArg = cypherDirective.arguments?.find(
                (x) => x.name.value === "arguments"
            ) as ArgumentNode;

            const statement = (statementArg
                ? valueFromASTUntyped(statementArg.value, variables)
                : undefined) as string | undefined;
            const args = (argumentsArg
                ? valueFromASTUntyped(argumentsArg.value, variables)
                : {}) as Record<string, unknown>;

            const apocParams = Object.entries(args).reduce(
                (r: { strs: string[]; params: any }, entry) => {
                    const argName = `${param}_cypher_arguments_${entry[0]}`;

                    return {
                        strs: [...r.strs, `${entry[0]}: $params.${argName}`],
                        params: { ...r.params, [argName]: entry[1] },
                    };
                },
                { strs: [], params: {} }
            ) as { strs: string[]; params: any };
            res.params = { ...res.params, ...apocParams.params };

            apocParams.strs.push(`this: ${varName}`);
            const paramsStr = `{ ${apocParams.strs.join(", ")} }`;

            if (selections.length) {
                const cpAndP = createMatchProjectionAndParams({
                    projectField: value,
                    varName: param,
                    variables,
                    chainStr: `${param}_cypher`,
                });
                res.params = { ...res.params, ...cpAndP[1] };

                res.strs.push(
                    `${key}: [${param} IN apoc.cypher.runFirstColumn("${statement}", ${paramsStr}, true) | ${param} ${cpAndP[0]}]`
                );
            } else {
                res.strs.push(
                    `${key}: apoc.cypher.runFirstColumnSingle("${statement}", ${paramsStr})`
                );
            }

            return res;
        }

        if (!edgeDirective && !nodeDirective) {
            res.strs.push(`${key}: ${varName}.${key}`);

            return res;
        }

        if (edgeDirective) {
            const nodes = selections.filter(
                (x) =>
                    (x.directives || []).some((d) => d.name.value === "node") &&
                    !(x.directives || []).some((d) => d.name.value === "edge")
            ) as FieldNode[];

            const relationship = selections.find((x) =>
                (x.directives || []).find(
                    (d) => d.name.value === "relationship"
                )
            ) as FieldNode;

            const type = (((edgeDirective.arguments || []).find(
                (x) => x.name.value === "type"
            ) as ArgumentNode).value as StringValueNode).value;

            const direction: Direction = valueFromASTUntyped(
                ((edgeDirective.arguments || []).find(
                    (x) => x.name.value === "direction"
                ) as ArgumentNode).value,
                variables
            ) as Direction;
            const inStr = direction === "IN" ? "<-" : "-";
            const outStr = direction === "OUT" ? "->" : "-";
            const typeStr = `[${
                relationship ? `${relationship.name.value}` : ""
            }:${type}]`;

            let projectionRows: string[] = [];

            if (nodeDirective) {
                if (nodes.length) {
                    throw new Error("Cannot do that"); // TODO
                }

                const refName = value.name.value;
                const labelArg = (nodeDirective?.arguments || []).find(
                    (x) => x.name.value === "label"
                ) as ArgumentNode;
                const label = labelArg
                    ? valueFromASTUntyped(labelArg.value, variables)
                    : (undefined as string | undefined);

                const pathStr = `(${varName})${inStr}${typeStr}${outStr}(${refName}${
                    label ? `:${label}` : ""
                })`;

                const nodeMAndP = createMatchProjectionAndParams({
                    projectField: value,
                    varName: key,
                    chainStr: param,
                    variables,
                });
                res.params = {
                    ...res.params,
                    ...nodeMAndP[1],
                };

                const innerPath = `[ ${pathStr} | ${
                    nodeMAndP[0] || key
                } ]${skipLimit}`;

                res.strs.push(`${key}: ${innerPath}`);

                return res;
            }

            let relW = "";
            let relMP = "";
            if (relationship) {
                const relSelections = (relationship?.selectionSet?.selections ||
                    []) as FieldNode[];
                const relProject = relSelections.find(
                    (x) => x.name.value === "PROJECT"
                );
                const relWhere = relSelections.find(
                    (x) => x.name.value === "WHERE"
                );

                if (relProject) {
                    const relMPAndP = createMatchProjectionAndParams({
                        projectField: relProject,
                        varName: relationship.name.value,
                        chainStr: `${param}_${relationship.name.value}`,
                        variables,
                    });
                    if (relMPAndP[0]) {
                        relMP = relMPAndP[0];
                        res.params = {
                            ...res.params,
                            ...relMPAndP[1],
                        };
                    }
                }

                if (relWhere) {
                    const relWAndP = createWhereAndParams({
                        varName: relationship.name.value,
                        whereField: relWhere,
                        chainStr: `${param}_${relationship.name.value}_where`,
                        variables,
                        noWhere: true,
                    });
                    if (relWAndP[0]) {
                        relW = relWAndP[0];
                        res.params = {
                            ...res.params,
                            ...relWAndP[1],
                        };
                    }
                }
            }
            if (relMP) {
                projectionRows.push(`${relationship.name.value}: ${relMP}`);
            }

            let nodeLabels: string[] = [];
            let nodeMP = "";
            let nodeW = "";
            let nodeS = "";

            nodes.forEach((node) => {
                const nodeDirective = node.directives?.find(
                    (x) => x.name.value === "node"
                );
                const labelArg = (nodeDirective?.arguments || []).find(
                    (x) => x.name.value === "label"
                ) as ArgumentNode;
                const label = labelArg
                    ? valueFromASTUntyped(labelArg.value, variables)
                    : (undefined as string | undefined);
                if (label) {
                    nodeLabels.push(label);
                }

                const nodeSelections = (node.selectionSet?.selections ||
                    []) as FieldNode[];
                const nodeProject = nodeSelections.find(
                    (x) => x.name.value === "PROJECT"
                );
                const nodeWhere = nodeSelections.find(
                    (x) => x.name.value === "WHERE"
                );
                const nodeSort = nodeSelections.find(
                    (x) => x.name.value === "SORT"
                );

                const varName = nodes.length > 1 ? param : node.name.value;
                const chainStr = `${param}_${node.name.value}`;

                if (nodeProject) {
                    const nodeMAndP = createMatchProjectionAndParams({
                        projectField: nodeProject,
                        varName,
                        chainStr,
                        variables,
                    });
                    if (nodeMAndP[0]) {
                        nodeMP = nodeMAndP[0];
                        res.params = {
                            ...res.params,
                            ...nodeMAndP[1],
                        };
                    }
                }

                if (nodeWhere) {
                    const nodeWAndP = createWhereAndParams({
                        varName,
                        whereField: nodeWhere,
                        chainStr: `${chainStr}_where`,
                        variables,
                        noWhere: true,
                    });
                    if (nodeWAndP[0]) {
                        nodeW = nodeWAndP[0];
                        res.params = {
                            ...res.params,
                            ...nodeWAndP[1],
                        };
                    }
                }

                if (nodeSort) {
                    const nodeSAndP = createSortAndParams({
                        varName,
                        sortField: nodeSort,
                        variables,
                        nestedVersion: true,
                    });
                    if (nodeSAndP[0]) {
                        nodeS = nodeSAndP[0];
                        res.params = {
                            ...res.params,
                            ...nodeSAndP[1],
                        };
                    }
                }

                const whereLabel = label
                    ? `'${label}' IN labels(${param})`
                    : "";

                const nodeProjectionStrs = [
                    `${node.name.value}: head([`,
                    `${param} IN [${param}]`,
                    `WHERE ${[whereLabel, nodeW]
                        .filter(Boolean)
                        .join(" AND ")}`,
                    "|",
                    `${nodeMP || param}`,
                    `])`,
                ];

                projectionRows.push(nodeProjectionStrs.join(" "));
            });

            if (nodes.length === 1) {
                const whereStrs = [nodeW, relW].filter(Boolean);
                let whereStr = whereStrs.length
                    ? `WHERE ${whereStrs.join(" AND ")}`
                    : "";
                const refName = nodes[0].name.value;
                const label = nodeLabels[0];
                const pathStr = `(${varName})${inStr}${typeStr}${outStr}(${refName}${
                    label ? `:${label}` : ""
                })`;

                if (nodeMP && relMP) {
                    const innerPath = [
                        `[ ${pathStr} ${whereStr} | { ${refName}: ${nodeMP},`,
                        `${relationship.name.value}: ${relMP}`,
                        `} ]${skipLimit}`,
                    ].join(" ");

                    if (nodeS) {
                        res.strs.push(
                            `${key}: apoc.coll.sortMulti(${innerPath}, ${nodeS})${skipLimit}`
                        );
                    } else {
                        res.strs.push(`${key}: ${innerPath}${skipLimit}`);
                    }
                } else if (nodeMP) {
                    const innerPath = `[ ${pathStr} ${whereStr} | { ${refName}: ${nodeMP} } ]`;

                    if (nodeS) {
                        res.strs.push(
                            `${key}: apoc.coll.sortMulti(${innerPath}, ${nodeS})${skipLimit}`
                        );
                    } else {
                        res.strs.push(`${key}: ${innerPath}${skipLimit}`);
                    }
                } else if (relMP) {
                    res.strs.push(
                        `${key}: [ ${pathStr} ${whereStr} | { ${relationship.name.value}: ${relMP} } ]`
                    );
                }

                return res;
            }

            if (nodes.length > 1) {
                const whereLabels = nodeLabels.length
                    ? `${nodeLabels
                          .map((l) => `'${l}' IN labels(${param})`)
                          .join(" OR ")}`
                    : "";
                const whereStrs = [whereLabels, relW].filter(Boolean);
                let whereStr = whereStrs.length
                    ? `WHERE ${whereStrs.join(" AND ")}`
                    : "";
                const pathStr = `(${varName})${inStr}${typeStr}${outStr}(${param})`;
                res.strs.push(
                    `${key}: [ ${pathStr} ${whereStr} | { ${projectionRows.join(
                        ",\n"
                    )} } ]`
                );

                return res;
            }
        }

        return res;
    }

    const { strs, params } = (projectField.selectionSet
        ?.selections as FieldNode[]).reduce(
        (r: Res, v: FieldNode) => reducer(r, v),
        {
            strs: [],
            params: {},
        }
    );

    return [`{ ${strs.join(", ")} }`, params];
}

function createMatchAndParams({
    matchField,
    variables,
}: {
    matchField: FieldNode;
    variables: Record<string, unknown>;
}): [string, any] {
    let cyphers: string[] = [];
    let params: Record<string, unknown> = {};

    (matchField.selectionSet?.selections as FieldNode[]).forEach((field) => {
        const varName = field.name.value;
        const selections = (field.selectionSet?.selections ||
            []) as FieldNode[];
        const whereField = selections.find((x) => x.name.value === "WHERE");
        const sortField = selections.find((x) => x.name.value === "SORT");
        const projectField = selections.find((x) => x.name.value === "PROJECT");
        const nodeDirective = field.directives?.find(
            (x) => x.name.value === "node"
        ) as DirectiveNode;
        const cypherDirective = field.directives?.find(
            (x) => x.name.value === "cypher"
        ) as DirectiveNode;
        const paginateDirective = field.directives?.find(
            (x) => x.name.value === "paginate"
        ) as DirectiveNode;

        cyphers.push(`CALL {`);

        if (cypherDirective) {
            const statementArg = cypherDirective.arguments?.find(
                (x) => x.name.value === "statement"
            ) as ArgumentNode;
            const argumentsArg = cypherDirective.arguments?.find(
                (x) => x.name.value === "arguments"
            ) as ArgumentNode;

            const statement = (statementArg
                ? valueFromASTUntyped(statementArg.value, variables)
                : undefined) as string | undefined;
            const args = (argumentsArg
                ? valueFromASTUntyped(argumentsArg.value, variables)
                : {}) as Record<string, unknown>;

            const apocParams = Object.entries(args).reduce(
                (r: { strs: string[]; params: any }, entry) => {
                    const argName = `${varName}_cypher_arguments_${entry[0]}`;

                    return {
                        strs: [...r.strs, `${entry[0]}: $params.${argName}`],
                        params: { ...r.params, [argName]: entry[1] },
                    };
                },
                { strs: [], params: {} }
            ) as { strs: string[]; params: any };
            params = { ...params, ...apocParams.params };

            const paramsStr = apocParams.strs.length
                ? `{ ${apocParams.strs.join(", ")} }`
                : "{}";

            if (selections.length) {
                const cpAndP = createMatchProjectionAndParams({
                    projectField: field,
                    varName,
                    variables,
                });
                params = { ...params, ...cpAndP[1] };

                cyphers.push(
                    `RETURN head([${varName} IN apoc.cypher.runFirstColumn("${statement}", ${paramsStr}, true)  | ${varName} ${cpAndP[0]}]) AS ${varName}`
                );
            } else {
                cyphers.push(
                    `RETURN apoc.cypher.runFirstColumnSingle("${statement}", ${paramsStr}) AS ${varName}`
                );
            }
        } else if (!nodeDirective) {
            throw new Error("@node required");
        } else if (nodeDirective) {
            const labelArg = (nodeDirective?.arguments || [])?.find(
                (x) => x.name.value === "label"
            ) as ArgumentNode;

            const label = labelArg
                ? valueFromASTUntyped(labelArg.value, variables)
                : (undefined as string | undefined);

            cyphers.push(`MATCH (${varName}${label ? `:${label}` : ""})`);

            if (whereField) {
                const whereAndParams = createWhereAndParams({
                    varName,
                    whereField,
                    chainStr: `${varName}_where`,
                    variables,
                });
                cyphers.push(whereAndParams[0]);
                params = { ...params, ...whereAndParams[1] };
            }

            if (sortField) {
                const sortAndParams = createSortAndParams({
                    varName,
                    sortField,
                    variables,
                });
                cyphers.push(sortAndParams[0]);
                params = { ...params, ...sortAndParams[1] };
            }

            if (projectField) {
                const matchProjectionAndParams = createMatchProjectionAndParams(
                    {
                        varName,
                        projectField,
                        variables,
                    }
                );
                params = { ...params, ...matchProjectionAndParams[1] };

                cyphers.push(
                    `RETURN ${varName} ${matchProjectionAndParams[0]} AS ${varName}`
                );
            } else {
                cyphers.push(`RETURN ${varName}`);
            }

            if (paginateDirective) {
                const skipArgument = paginateDirective.arguments?.find(
                    (x) => x.name.value === "skip"
                ) as ArgumentNode;

                const limitArgument = paginateDirective.arguments?.find(
                    (x) => x.name.value === "limit"
                ) as ArgumentNode;

                if (skipArgument) {
                    const skip = valueFromASTUntyped(
                        skipArgument.value,
                        variables
                    );
                    cyphers.push(`SKIP ${skip}`);
                }

                if (limitArgument) {
                    const limit = valueFromASTUntyped(
                        limitArgument.value,
                        variables
                    );
                    cyphers.push(`LIMIT ${limit}`);
                }
            }
        }

        cyphers.push(`}`); // close CALL
    });

    return [cyphers.join("\n"), params];
}

export default createMatchAndParams;
