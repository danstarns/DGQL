import { ArgumentNode, FieldNode, valueFromASTUntyped } from "graphql";

function createWhereAndParams({
    varName,
    whereField,
    chainStr,
    variables,
}: {
    varName: string;
    whereField: FieldNode;
    chainStr?: string;
    variables: Record<string, unknown>;
}): [string, Record<string, unknown>] {
    const strs: string[] = [];
    let params: Record<string, unknown> = {};
    const selections = whereField.selectionSet?.selections as FieldNode[];

    if (selections.length) {
        strs.push("WHERE");
    }

    selections.forEach((field) => {
        let param: string;
        if (chainStr) {
            param = `${chainStr}_${field.name.value}`;
        } else {
            param = `${varName}_${field.name.value}`;
        }

        let innerStrs: string[] = [];

        (field.arguments as ArgumentNode[]).forEach((arg) => {
            const value = valueFromASTUntyped(arg.value, variables);
            const paramName = `${param}_${arg.name.value}`;

            if (arg.name.value === "equal") {
                innerStrs.push(
                    `${varName}.${field.name.value} = $params.${paramName}`
                );
            }

            if (arg.name.value === "not") {
                innerStrs.push(
                    `NOT ${varName}.${field.name.value} = $params.${paramName}`
                );
            }

            if (arg.name.value === "gt") {
                innerStrs.push(
                    `${varName}.${field.name.value} > $params.${paramName}`
                );
            }

            if (arg.name.value === "gte") {
                innerStrs.push(
                    `${varName}.${field.name.value} >= $params.${paramName}`
                );
            }

            if (arg.name.value === "lt") {
                innerStrs.push(
                    `${varName}.${field.name.value} < $params.${paramName}`
                );
            }

            if (arg.name.value === "lte") {
                innerStrs.push(
                    `${varName}.${field.name.value} <= $params.${paramName}`
                );
            }

            if (arg.name.value === "starts_with") {
                innerStrs.push(
                    `${varName}.${field.name.value} STARTS WITH $params.${paramName}`
                );
            }

            if (arg.name.value === "ends_with") {
                innerStrs.push(
                    `${varName}.${field.name.value} ENDS WITH $params.${paramName}`
                );
            }

            if (arg.name.value === "contains") {
                innerStrs.push(
                    `${varName}.${field.name.value} CONTAINS $params.${paramName}`
                );
            }

            if (arg.name.value === "regex") {
                innerStrs.push(
                    `${varName}.${field.name.value} =~ $params.${paramName}`
                );
            }

            params[paramName] = value;
        });

        strs.push(innerStrs.join(" AND "));
    });

    return [strs.join("\n"), params];
}

export default createWhereAndParams;
