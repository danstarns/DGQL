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

function createMatchProjectionAndParams({
    varName,
    returnField,
    chainStr,
    variables,
}: {
    varName: string;
    returnField: FieldNode;
    chainStr?: string;
    variables: Record<string, unknown>;
}): [string, any] {
    interface Res {
        strs: string[];
        params: any;
    }

    function reducer(res: Res, value: FieldNode): Res {
        let param: string;

        if (chainStr) {
            param = `${chainStr}_${value.name.value}`;
        } else {
            param = `${varName}_${value.name.value}`;
        }

        const nodeDirective = value.directives?.find(
            (x) => x.name.value === "node"
        ) as DirectiveNode;

        const edgeDirective = value.directives?.find(
            (x) => x.name.value === "edge"
        ) as DirectiveNode;

        const paginateDirective = value.directives?.find(
            (x) => x.name.value === "paginate"
        ) as DirectiveNode;

        if (edgeDirective) {
            const node = (value.selectionSet
                ?.selections as FieldNode[]).find((x) =>
                x.directives?.find((d) => d.name.value === "node")
            ) as FieldNode;

            const relationship = (value.selectionSet
                ?.selections as FieldNode[]).find((x) =>
                x.directives?.find((d) => d.name.value === "relationship")
            ) as FieldNode;

            const type = ((edgeDirective.arguments?.find(
                (x) => x.name.value === "type"
            ) as ArgumentNode).value as StringValueNode).value;

            const direction: Direction = valueFromASTUntyped(
                (edgeDirective.arguments?.find(
                    (x) => x.name.value === "direction"
                ) as ArgumentNode).value,
                variables
            ) as Direction;

            const nodeDirective = node.directives?.find(
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

            const nodeReturn = ((node.selectionSet?.selections ||
                []) as FieldNode[]).find((x) => x.name.value === "RETURN") as
                | FieldNode
                | undefined;

            const nodeWhere = ((node.selectionSet?.selections ||
                []) as FieldNode[]).find((x) => x.name.value === "WHERE") as
                | FieldNode
                | undefined;

            const nodeSort = ((node.selectionSet?.selections ||
                []) as FieldNode[]).find((x) => x.name.value === "SORT") as
                | FieldNode
                | undefined;

            const relationshipReturn =
                relationship &&
                ((relationship.selectionSet?.selections as FieldNode[]).find(
                    (x) => x.name.value === "RETURN"
                ) as FieldNode | undefined);

            const relationshipWhere =
                relationship &&
                (((relationship.selectionSet?.selections ||
                    []) as FieldNode[]).find(
                    (x) => x.name.value === "WHERE"
                ) as FieldNode | undefined);

            let nestedNodeMatchProjectionAndParams: [string?, any?] = ["", {}];
            if (nodeReturn) {
                nestedNodeMatchProjectionAndParams = createMatchProjectionAndParams(
                    {
                        returnField: nodeReturn,
                        varName: node.name.value,
                        chainStr: `${param}_${node.name.value}`,
                        variables,
                    }
                );
            }

            let nestedRelationshipMatchProjectionAndParams: [string?, any?] = [
                "",
                {},
            ];
            if (relationshipReturn) {
                nestedRelationshipMatchProjectionAndParams = createMatchProjectionAndParams(
                    {
                        returnField: relationshipReturn,
                        varName: relationship.name.value,
                        chainStr: `${param}_${relationship.name.value}`,
                        variables,
                    }
                );
            }

            let nodeWhereAndParams: [string?, any?] = ["", {}];
            if (nodeWhere) {
                nodeWhereAndParams = createWhereAndParams({
                    varName: node.name.value,
                    whereField: nodeWhere,
                    chainStr: `${param}_${node.name.value}_where`,
                    variables,
                });
            }

            let relationshipWhereAndParams: [string?, any?] = ["", {}];
            if (relationshipWhere) {
                relationshipWhereAndParams = createWhereAndParams({
                    varName: relationship.name.value,
                    whereField: relationshipWhere,
                    chainStr: `${param}_${relationship.name.value}_where`,
                    variables,
                });
            }

            let nodeSortAndParams: [string?, any?] = ["", {}];
            if (nodeSort) {
                nodeSortAndParams = createSortAndParams({
                    varName: node.name.value,
                    sortField: nodeSort,
                    chainStr: `${param}_${node.name.value}_where`,
                    variables,
                    nestedVersion: true,
                });
            }

            const whereStrs = [
                ...(nodeWhereAndParams[0]
                    ? [nodeWhereAndParams[0].replace("WHERE", "")]
                    : []),
                ...(relationshipWhereAndParams[0]
                    ? [relationshipWhereAndParams[0].replace("WHERE", "")]
                    : []),
            ];
            let whereStr = whereStrs.length
                ? `WHERE ${whereStrs.join(" AND ")}`
                : "";

            res.params = {
                ...res.params,
                ...nestedNodeMatchProjectionAndParams[1],
                ...nestedRelationshipMatchProjectionAndParams[1],
                ...nodeWhereAndParams[1],
                ...relationshipWhereAndParams[1],
                ...nodeSortAndParams[1],
            };

            let sortLimitStr = "";
            if (paginateDirective) {
                const skipArgument = paginateDirective.arguments?.find(
                    (x) => x.name.value === "skip"
                ) as ArgumentNode;

                const limitArgument = paginateDirective.arguments?.find(
                    (x) => x.name.value === "limit"
                ) as ArgumentNode;

                if (skipArgument && !limitArgument) {
                    const skip = valueFromASTUntyped(
                        skipArgument.value,
                        variables
                    );
                    sortLimitStr = `[${skip}..]`;
                }

                if (limitArgument && !skipArgument) {
                    const limit = valueFromASTUntyped(
                        limitArgument.value,
                        variables
                    );
                    sortLimitStr = `[..${limit}]`;
                }

                if (limitArgument && skipArgument) {
                    const skip = valueFromASTUntyped(
                        skipArgument.value,
                        variables
                    );
                    const limit = valueFromASTUntyped(
                        limitArgument.value,
                        variables
                    );
                    sortLimitStr = `[${skip}..${limit}]`;
                }
            }

            if (
                nestedNodeMatchProjectionAndParams[0] &&
                nestedRelationshipMatchProjectionAndParams[0]
            ) {
                const innerPath = [
                    `[ ${pathStr} ${whereStr} | { ${node.name.value}: ${nestedNodeMatchProjectionAndParams[0]},`,
                    `${relationship.name.value}: ${nestedRelationshipMatchProjectionAndParams[0]}`,
                    `} ]${sortLimitStr}`,
                ].join(" ");

                if (nodeSortAndParams[0]) {
                    res.strs.push(
                        `${value.name.value}: apoc.coll.sortMulti(${innerPath}, ${nodeSortAndParams[0]})${sortLimitStr}`
                    );
                } else {
                    res.strs.push(
                        `${value.name.value}: ${innerPath}${sortLimitStr}`
                    );
                }
            } else if (nestedNodeMatchProjectionAndParams[0]) {
                const innerPath = `[ ${pathStr} ${whereStr} | { ${node.name.value}: ${nestedNodeMatchProjectionAndParams[0]} } ]`;

                if (nodeSortAndParams[0]) {
                    res.strs.push(
                        `${value.name.value}: apoc.coll.sortMulti(${innerPath}, ${nodeSortAndParams[0]})${sortLimitStr}`
                    );
                } else {
                    res.strs.push(
                        `${value.name.value}: ${innerPath}${sortLimitStr}`
                    );
                }
            } else if (nestedRelationshipMatchProjectionAndParams[0]) {
                res.strs.push(
                    `${value.name.value}: [ ${pathStr} ${whereStr} | { ${relationship.name.value}: ${nestedRelationshipMatchProjectionAndParams[0]} } ]`
                );
            }
        }

        if (!edgeDirective && !nodeDirective) {
            res.strs.push(
                `${value.name.value}: ${varName}.${value.name.value}`
            );
        }

        return res;
    }

    const { strs, params } = (returnField.selectionSet
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
        const selections = field.selectionSet?.selections as FieldNode[];
        const whereField = selections.find((x) => x.name.value === "WHERE");
        const sortField = selections.find((x) => x.name.value === "SORT");
        const returnField = selections.find((x) => x.name.value === "RETURN");
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

        if (returnField) {
            const matchProjectionAndParams = createMatchProjectionAndParams({
                varName,
                returnField,
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
