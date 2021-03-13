import { ArgumentNode, FieldNode, valueFromASTUntyped } from "graphql";

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

    selections.forEach((field) => {
        let param: string;
        if (chainStr) {
            param = `${chainStr}_${field.name.value}`;
        } else {
            param = `${varName}_${field.name.value}`;
        }

        if (["AND", "OR", "XOR"].includes(field.name.value)) {
            const logicStrs: string[] = [];
            const logicSelections = (field as FieldNode).selectionSet
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
            strs.push(logicStrs.join(` ${field.name.value} `));
        }

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
