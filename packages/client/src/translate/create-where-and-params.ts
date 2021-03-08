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

            if (arg.name.value === "equal") {
                const paramName = `${param}_${arg.name.value}`;
                params[paramName] = value;
                innerStrs.push(
                    `${varName}.${field.name.value} = $params.${paramName}`
                );
            }
        });

        strs.push(innerStrs.join(" AND "));
    });

    return [strs.join("\n"), params];
}

export default createWhereAndParams;
