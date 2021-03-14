import { ArgumentNode, FieldNode, valueFromASTUntyped } from "graphql";
import { Direction } from "../types";

const predicateFunctions = ["all", "any", "exists", "none", "single"];

function createWhereAndParams({
    varName,
    whereField,
    chainStr,
    variables,
    noWhere,
}: {
    varName: string;
    whereField: FieldNode;
    chainStr?: string;
    variables: Record<string, unknown>;
    noWhere?: boolean;
}): [string, Record<string, unknown>] {
    const strs: string[] = [];
    let params: Record<string, unknown> = {};
    const selections = whereField.selectionSet?.selections as FieldNode[];
    const edges = selections.filter((x) => x.name.value === "EDGE");
    const logical = selections.filter((x) =>
        ["AND", "OR", "XOR"].includes(x.name.value)
    );
    const field = selections.filter(
        (x) => !["AND", "OR", "XOR", "EDGE"].includes(x.name.value)
    );

    const getParam = (field: FieldNode) => {
        let param: string;
        if (chainStr) {
            param = `${chainStr}_${field.name.value}`;
        } else {
            param = `${varName}_${field.name.value}`;
        }

        return param;
    };

    edges.forEach((edge, index) => {
        const param = `${getParam(edge)}${index}`;

        const typeArg = edge.arguments?.find((x) => x.name.value === "type");

        const directionArg = edge.arguments?.find(
            (x) => x.name.value === "direction"
        );

        const type = typeArg
            ? valueFromASTUntyped(typeArg.value, variables)
            : undefined;

        const direction = (directionArg
            ? valueFromASTUntyped(directionArg.value, variables)
            : undefined) as Direction | undefined;

        const edgeSelections = (edge?.selectionSet?.selections ||
            []) as FieldNode[];

        const predicateFunDirec = edge.directives?.find((x) =>
            predicateFunctions.includes(x.name.value)
        );

        const predicateFuncName = predicateFunDirec?.name?.value;
        const node = edgeSelections.find((x) => x.name.value === "NODE");
        const labelArg = node?.arguments?.find((x) => x.name.value === "label");

        let label = labelArg
            ? valueFromASTUntyped(labelArg.value, variables)
            : undefined;

        const nodeDirective = edge.directives?.find(
            (x) => x.name.value === "node"
        );
        if (nodeDirective) {
            const labelArg = nodeDirective?.arguments?.find(
                (x) => x.name.value === "label"
            );
            label = labelArg
                ? valueFromASTUntyped(labelArg.value, variables)
                : undefined;
        }

        const nodeParam = `${param}_node`;
        const inStr = direction === "IN" ? "<-" : "-";
        const outStr = direction === "OUT" ? "->" : "-";
        const labelStr = label ? `:${label}` : "";
        const typeStr = `[${type ? `:${type}` : ""}]`;

        const innerStrs: string[] = [
            `EXISTS((${varName})${inStr}${typeStr}${outStr}(${labelStr}))`,
        ];

        if (!edgeSelections.length) {
            if (predicateFuncName === "exists") {
                strs.push(innerStrs.join(""));
                return;
            }

            return;
        }

        if (predicateFuncName === "exists") {
            strs.push(innerStrs.join(""));
            return;
        }

        if (node?.selectionSet?.selections) {
            const nWAndP = createWhereAndParams({
                varName: nodeParam,
                chainStr: nodeParam,
                whereField: node,
                variables,
                noWhere: true,
            });

            if (nWAndP[0]) {
                const path = `[(${varName})${inStr}${typeStr}${outStr}(${nodeParam}${labelStr}) | ${nodeParam}]`;
                innerStrs.push(
                    `${(
                        predicateFuncName || "ALL"
                    )?.toUpperCase()}(${nodeParam} IN ${path} WHERE ${
                        nWAndP[0]
                    })`
                );
                params = { ...params, ...nWAndP[1] };
            }
        }

        strs.push(innerStrs.join(" AND "));
    });

    logical.forEach((logic, index) => {
        const param = `${getParam(logic)}${index}`;

        const logicStrs: string[] = [];
        const logicSelections = (logic as FieldNode).selectionSet
            ?.selections as FieldNode[];

        logicSelections.forEach((selection, i) => {
            if (selection.name.value === "WHERE") {
                const wAndP = createWhereAndParams({
                    varName,
                    chainStr: `${param}${i}`,
                    variables,
                    whereField: selection,
                    noWhere: true,
                });
                logicStrs.push(wAndP[0]);
                params = { ...params, ...wAndP[1] };
            }
        });
        strs.push(logicStrs.join(` ${logic.name.value} `));
    });

    field.forEach((field, index) => {
        const param = `${getParam(field)}${index}`;

        (field.arguments as ArgumentNode[]).forEach((arg) => {
            const value = valueFromASTUntyped(arg.value, variables);
            const paramName = `${param}_${arg.name.value}`;

            if (arg.name.value === "equal") {
                strs.push(
                    `${varName}.${field.name.value} = $params.${paramName}`
                );
            }

            if (arg.name.value === "not") {
                strs.push(
                    `NOT ${varName}.${field.name.value} = $params.${paramName}`
                );
            }

            if (arg.name.value === "gt") {
                strs.push(
                    `${varName}.${field.name.value} > $params.${paramName}`
                );
            }

            if (arg.name.value === "gte") {
                strs.push(
                    `${varName}.${field.name.value} >= $params.${paramName}`
                );
            }

            if (arg.name.value === "lt") {
                strs.push(
                    `${varName}.${field.name.value} < $params.${paramName}`
                );
            }

            if (arg.name.value === "lte") {
                strs.push(
                    `${varName}.${field.name.value} <= $params.${paramName}`
                );
            }

            if (arg.name.value === "starts_with") {
                strs.push(
                    `${varName}.${field.name.value} STARTS WITH $params.${paramName}`
                );
            }

            if (arg.name.value === "ends_with") {
                strs.push(
                    `${varName}.${field.name.value} ENDS WITH $params.${paramName}`
                );
            }

            if (arg.name.value === "contains") {
                strs.push(
                    `${varName}.${field.name.value} CONTAINS $params.${paramName}`
                );
            }

            if (arg.name.value === "regex") {
                strs.push(
                    `${varName}.${field.name.value} =~ $params.${paramName}`
                );
            }

            params[paramName] = value;
        });
    });

    return [`${!noWhere ? "WHERE " : " "}${strs.join(" AND ")}`, params];
}

export default createWhereAndParams;
