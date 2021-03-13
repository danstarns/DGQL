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

        const selections = value.selectionSet?.selections as FieldNode[];

        const nodeDirective = value.directives?.find(
            (x) => x.name.value === "node"
        ) as DirectiveNode;

        const edgeDirective = value.directives?.find(
            (x) => x.name.value === "edge"
        ) as DirectiveNode;

        const paginateDirective = value.directives?.find(
            (x) => x.name.value === "paginate"
        ) as DirectiveNode;

        if (!edgeDirective && !nodeDirective) {
            res.strs.push(`${key}: ${varName}.${key}`);

            return res;
        }

        if (edgeDirective) {
            const node = selections.find((x) =>
                (x.directives || []).find((d) => d.name.value === "node")
            ) as FieldNode;

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

            const nodeDirective = (node.directives || []).find(
                (x) => x.name.value === "node"
            );
            const labelArg = (nodeDirective?.arguments || []).find(
                (x) => x.name.value === "label"
            ) as ArgumentNode;

            const label = labelArg
                ? valueFromASTUntyped(labelArg.value, variables)
                : (undefined as string | undefined);

            const inStr = direction === "IN" ? "<-" : "-";

            const outStr = direction === "OUT" ? "->" : "-";

            const typeStr = `[${
                relationship ? relationship.name.value : ""
            }:${type}]`;

            const labelStr = label ? `:${label}` : "";

            const toNodeStr = node
                ? `(${node.name.value}${labelStr})`
                : `(${labelStr})`;

            const pathStr = `(${varName})${inStr}${typeStr}${outStr}${toNodeStr}`;

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

            const relSelections = (relationship?.selectionSet?.selections ||
                []) as FieldNode[];
            const relProject = relSelections.find(
                (x) => x.name.value === "PROJECT"
            );
            const relWhere = relSelections.find(
                (x) => x.name.value === "WHERE"
            );

            let nodeMAndP: [string?, any?] = ["", {}];
            if (nodeProject) {
                nodeMAndP = createMatchProjectionAndParams({
                    projectField: nodeProject,
                    varName: node.name.value,
                    chainStr: `${param}_${node.name.value}`,
                    variables,
                });
            }

            let relMAndP: [string?, any?] = ["", {}];
            if (relProject) {
                relMAndP = createMatchProjectionAndParams({
                    projectField: relProject,
                    varName: relationship.name.value,
                    chainStr: `${param}_${relationship.name.value}`,
                    variables,
                });
            }

            let nodeWAndP: [string?, any?] = ["", {}];
            if (nodeWhere) {
                nodeWAndP = createWhereAndParams({
                    varName: node.name.value,
                    whereField: nodeWhere,
                    chainStr: `${param}_${node.name.value}_where`,
                    variables,
                });
            }

            let relWAndP: [string?, any?] = ["", {}];
            if (relWhere) {
                relWAndP = createWhereAndParams({
                    varName: relationship.name.value,
                    whereField: relWhere,
                    chainStr: `${param}_${relationship.name.value}_where`,
                    variables,
                });
            }

            let nodeSAndP: [string?, any?] = ["", {}];
            if (nodeSort) {
                nodeSAndP = createSortAndParams({
                    varName: node.name.value,
                    sortField: nodeSort,
                    chainStr: `${param}_${node.name.value}_where`,
                    variables,
                    nestedVersion: true,
                });
            }

            const wheres = [
                ...(nodeWAndP[0] ? [nodeWAndP[0].replace("WHERE", "")] : []),
                ...(relWAndP[0] ? [relWAndP[0].replace("WHERE", "")] : []),
            ];
            let whereStr = wheres.length ? `WHERE ${wheres.join(" AND ")}` : "";

            res.params = {
                ...res.params,
                ...nodeMAndP[1],
                ...relMAndP[1],
                ...nodeWAndP[1],
                ...relWAndP[1],
                ...nodeSAndP[1],
            };

            const skipLimit = createSkipLimitStr({
                paginateDirective,
                variables,
            });

            if (nodeMAndP[0] && relMAndP[0]) {
                const innerPath = [
                    `[ ${pathStr} ${whereStr} | { ${node.name.value}: ${nodeMAndP[0]},`,
                    `${relationship.name.value}: ${relMAndP[0]}`,
                    `} ]${skipLimit}`,
                ].join(" ");

                if (nodeSAndP[0]) {
                    res.strs.push(
                        `${key}: apoc.coll.sortMulti(${innerPath}, ${nodeSAndP[0]})${skipLimit}`
                    );
                } else {
                    res.strs.push(`${key}: ${innerPath}${skipLimit}`);
                }
            } else if (nodeMAndP[0]) {
                const innerPath = `[ ${pathStr} ${whereStr} | { ${node.name.value}: ${nodeMAndP[0]} } ]`;

                if (nodeSAndP[0]) {
                    res.strs.push(
                        `${key}: apoc.coll.sortMulti(${innerPath}, ${nodeSAndP[0]})${skipLimit}`
                    );
                } else {
                    res.strs.push(`${key}: ${innerPath}${skipLimit}`);
                }
            } else if (relMAndP[0]) {
                res.strs.push(
                    `${key}: [ ${pathStr} ${whereStr} | { ${relationship.name.value}: ${relMAndP[0]} } ]`
                );
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
        const paginateDirective = field.directives?.find(
            (x) => x.name.value === "paginate"
        ) as DirectiveNode;

        // TODO Support top level MATCH for @relationship
        if (!nodeDirective) {
            return;
        }

        const labelArg = (nodeDirective?.arguments || [])?.find(
            (x) => x.name.value === "label"
        ) as ArgumentNode;

        const label = labelArg
            ? valueFromASTUntyped(labelArg.value, variables)
            : (undefined as string | undefined);

        cyphers.push(`CALL {`);
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
                chainStr: `${varName}_where`,
                variables,
            });
            cyphers.push(sortAndParams[0]);
            params = { ...params, ...sortAndParams[1] };
        }

        if (projectField) {
            const matchProjectionAndParams = createMatchProjectionAndParams({
                varName,
                projectField,
                variables,
            });
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
                const skip = valueFromASTUntyped(skipArgument.value, variables);
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

        cyphers.push(`}`); // close CALL
    });

    return [cyphers.join("\n"), params];
}

export default createMatchAndParams;
